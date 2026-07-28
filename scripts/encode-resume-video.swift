import AppKit
import AVFoundation
import CoreVideo
import Foundation

let arguments = CommandLine.arguments
guard arguments.count >= 4 else {
    fputs("Usage: swift encode-resume-video.swift output.mp4 card1.png card2.png ...\n", stderr)
    exit(2)
}

let outputURL = URL(fileURLWithPath: arguments[1])
let cardURLs = arguments.dropFirst(2).map { URL(fileURLWithPath: $0) }
let width = 1080
let height = 1920
let fps: Int32 = 30
let cardDuration = 3.0
let transitionDuration = 0.58
let totalDuration = Double(cardURLs.count) * cardDuration
let totalFrames = Int(totalDuration * Double(fps))

try? FileManager.default.removeItem(at: outputURL)

func loadImage(_ url: URL) -> CGImage? {
    guard let image = NSImage(contentsOf: url) else { return nil }
    var rect = NSRect(origin: .zero, size: image.size)
    return image.cgImage(forProposedRect: &rect, context: nil, hints: nil)
}

let images = cardURLs.compactMap(loadImage)
guard images.count == cardURLs.count else {
    fputs("Unable to load all storyboard cards.\n", stderr)
    exit(3)
}

let writer = try AVAssetWriter(outputURL: outputURL, fileType: .mp4)
let compression: [String: Any] = [
    AVVideoAverageBitRateKey: 9_000_000,
    AVVideoProfileLevelKey: AVVideoProfileLevelH264HighAutoLevel,
]
let settings: [String: Any] = [
    AVVideoCodecKey: AVVideoCodecType.h264,
    AVVideoWidthKey: width,
    AVVideoHeightKey: height,
    AVVideoCompressionPropertiesKey: compression,
]
let input = AVAssetWriterInput(mediaType: .video, outputSettings: settings)
input.expectsMediaDataInRealTime = false

let pixelBufferAttributes: [String: Any] = [
    kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32ARGB,
    kCVPixelBufferWidthKey as String: width,
    kCVPixelBufferHeightKey as String: height,
    kCVPixelBufferCGImageCompatibilityKey as String: true,
    kCVPixelBufferCGBitmapContextCompatibilityKey as String: true,
]
let adaptor = AVAssetWriterInputPixelBufferAdaptor(
    assetWriterInput: input,
    sourcePixelBufferAttributes: pixelBufferAttributes
)

guard writer.canAdd(input) else {
    fputs("Unable to add video input.\n", stderr)
    exit(4)
}
writer.add(input)

guard writer.startWriting() else {
    fputs("Unable to start video writer: \(writer.error?.localizedDescription ?? "unknown")\n", stderr)
    exit(5)
}
writer.startSession(atSourceTime: .zero)

func smoothstep(_ value: CGFloat) -> CGFloat {
    let clamped = max(0, min(1, value))
    return clamped * clamped * (3 - 2 * clamped)
}

func drawImage(
    _ image: CGImage,
    in context: CGContext,
    progress: CGFloat,
    alpha: CGFloat,
    offsetY: CGFloat = 0
) {
    let scale = 1.0 + 0.035 * progress
    let drawWidth = CGFloat(width) * scale
    let drawHeight = CGFloat(height) * scale
    let x = (CGFloat(width) - drawWidth) / 2
    let y = (CGFloat(height) - drawHeight) / 2 + offsetY - progress * 18
    context.saveGState()
    context.setAlpha(alpha)
    context.draw(image, in: CGRect(x: x, y: y, width: drawWidth, height: drawHeight))
    context.restoreGState()
}

for frame in 0..<totalFrames {
    while !input.isReadyForMoreMediaData {
        Thread.sleep(forTimeInterval: 0.002)
    }

    guard let pool = adaptor.pixelBufferPool else {
        fputs("Pixel buffer pool unavailable.\n", stderr)
        exit(6)
    }
    var optionalBuffer: CVPixelBuffer?
    CVPixelBufferPoolCreatePixelBuffer(nil, pool, &optionalBuffer)
    guard let pixelBuffer = optionalBuffer else {
        fputs("Unable to create pixel buffer.\n", stderr)
        exit(7)
    }

    CVPixelBufferLockBaseAddress(pixelBuffer, [])
    defer { CVPixelBufferUnlockBaseAddress(pixelBuffer, []) }

    guard
        let baseAddress = CVPixelBufferGetBaseAddress(pixelBuffer),
        let context = CGContext(
            data: baseAddress,
            width: width,
            height: height,
            bitsPerComponent: 8,
            bytesPerRow: CVPixelBufferGetBytesPerRow(pixelBuffer),
            space: CGColorSpaceCreateDeviceRGB(),
            bitmapInfo: CGImageAlphaInfo.premultipliedFirst.rawValue
                | CGBitmapInfo.byteOrder32Little.rawValue
        )
    else {
        fputs("Unable to create bitmap context.\n", stderr)
        exit(8)
    }

    context.setFillColor(NSColor.black.cgColor)
    context.fill(CGRect(x: 0, y: 0, width: width, height: height))

    let seconds = Double(frame) / Double(fps)
    let cardIndex = min(Int(seconds / cardDuration), images.count - 1)
    let localTime = seconds - Double(cardIndex) * cardDuration
    let localProgress = CGFloat(localTime / cardDuration)
    let transitionStart = cardDuration - transitionDuration

    if localTime >= transitionStart && cardIndex < images.count - 1 {
        let raw = CGFloat((localTime - transitionStart) / transitionDuration)
        let transition = smoothstep(raw)
        drawImage(
            images[cardIndex],
            in: context,
            progress: localProgress,
            alpha: 1 - transition * 0.78,
            offsetY: -transition * 80
        )
        drawImage(
            images[cardIndex + 1],
            in: context,
            progress: 0,
            alpha: transition,
            offsetY: (1 - transition) * 150
        )
    } else {
        drawImage(
            images[cardIndex],
            in: context,
            progress: localProgress,
            alpha: 1
        )
    }

    let presentationTime = CMTime(value: CMTimeValue(frame), timescale: fps)
    guard adaptor.append(pixelBuffer, withPresentationTime: presentationTime) else {
        fputs("Unable to append frame \(frame): \(writer.error?.localizedDescription ?? "unknown")\n", stderr)
        exit(9)
    }

    if frame % Int(fps * 3) == 0 {
        print("Rendered \(frame) / \(totalFrames) frames")
    }
}

input.markAsFinished()
let semaphore = DispatchSemaphore(value: 0)
writer.finishWriting {
    semaphore.signal()
}
semaphore.wait()

guard writer.status == .completed else {
    fputs("Video export failed: \(writer.error?.localizedDescription ?? "unknown")\n", stderr)
    exit(10)
}

print("Video export complete: \(outputURL.path)")
