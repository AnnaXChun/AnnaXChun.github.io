import AppKit
import AVFoundation
import Foundation

let arguments = CommandLine.arguments
guard arguments.count >= 4 else {
    fputs("Usage: swift extract-video-frames.swift video.mp4 output-directory second ...\n", stderr)
    exit(2)
}

let videoURL = URL(fileURLWithPath: arguments[1])
let outputURL = URL(fileURLWithPath: arguments[2], isDirectory: true)
let seconds = arguments.dropFirst(3).compactMap(Double.init)

try FileManager.default.createDirectory(
    at: outputURL,
    withIntermediateDirectories: true
)

let asset = AVURLAsset(url: videoURL)
let generator = AVAssetImageGenerator(asset: asset)
generator.appliesPreferredTrackTransform = true
generator.requestedTimeToleranceBefore = .zero
generator.requestedTimeToleranceAfter = .zero

for (index, second) in seconds.enumerated() {
    let time = CMTime(seconds: second, preferredTimescale: 600)
    let image = try generator.copyCGImage(at: time, actualTime: nil)
    let representation = NSBitmapImageRep(cgImage: image)
    guard let data = representation.representation(
        using: .png,
        properties: [:]
    ) else {
        continue
    }
    let destination = outputURL.appendingPathComponent(
        "frame-\(index + 1)-\(String(format: "%.1f", second)).png"
    )
    try data.write(to: destination)
    print(destination.path)
}
