import SwiftUI

struct LoadingView: View {
    @Binding var progress: Double
    @State private var scale = 0.8
    @State private var opacity = 0.5
    
    let timer = Timer.publish(every: 0.03, on: .main, in: .common).autoconnect()
    
    var body: some View {
        VStack(spacing: 30) {
            Image("Logo")
                .resizable()
                .frame(width: 240, height: 240)
                .scaleEffect(scale)
                .opacity(opacity)
                .onAppear {
                    withAnimation(.easeIn(duration: 1.1).repeatForever(autoreverses: true)) {
                        scale = 1.1
                        opacity = 1.0
                    }
                }
            Text("Intruder Detector")
                .font(.largeTitle)
                .fontWeight(.bold)
                .foregroundColor(Color.pink)
                .italic()
            
            Text("Protecting your assets by deterring potential intruders & proactively warning them.")
                .font(.body)
            
            ProgressView(value: progress, total: 100)
                .progressViewStyle(LinearProgressViewStyle(tint: Color.pink))
                .padding(.horizontal, 40)
            
            Text("Loading... \(Int(progress))%")
                .font(.subheadline)
                .foregroundColor(.gray)
        }
        .onReceive(timer) { _ in
            if progress < 101 {
                progress += 1
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color(.systemMint).opacity(0.2))
    }    
}
