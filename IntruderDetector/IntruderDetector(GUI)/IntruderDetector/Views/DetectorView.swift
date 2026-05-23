import SwiftUI

struct DetectorView: View {
    var body: some View {
        NavigationStack {
            VStack(spacing: 30) {
                VStack(spacing: 10) {
                    Text("Intruder Device")
                        .font(.title2)
                        .italic()
                        .foregroundColor(.white)

                    Image(systemName: "circle.circle")
                        .resizable()
                        .scaledToFit()
                        .frame(width: 40, height: 40)
                        .foregroundColor(.white.opacity(0.7))
                        .padding(.top, 30)
                }
                .padding(.top, 80)

                VStack {
                    Text("Devices")
                        .font(.headline)
                        .foregroundColor(.white)
                        .padding(.top, 10)

                    LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 20) {
                        DeviceButton(icon: "sun.max", label: "LED", destination: LEDView())
                        DeviceButton(icon: "speaker.wave.2", label: "Speaker", destination: SpeakerView())
                        DeviceButton(icon: "arrow.up.and.down.and.arrow.left.and.right", label: "PIR Motion", destination: PIRMotionView())
                        DeviceButton(icon: "video", label: "Camera", destination: CameraView())
                    }
                    .padding()
                    .padding(.top, 10)
                    .padding(.bottom, 10)
                    .background(Color("DarkGreen"))
                    .cornerRadius(25)
                }.padding(.top,30)

                Spacer()
            }
            .padding()
            .background(Color("DeepGreen"))
            .ignoresSafeArea()
        }
    }
}

struct DetectorView_Previews: PreviewProvider {
    static var previews: some View {
        DetectorView()
    }
}
