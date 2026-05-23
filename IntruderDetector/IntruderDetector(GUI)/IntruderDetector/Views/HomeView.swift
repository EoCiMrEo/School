import SwiftUI

struct HomeView: View {
    var body: some View {
        VStack(spacing: 30) {
            VStack(spacing: 10) {
                Text("Home")
                    .font(.title)
                    .italic()
                    .bold()
                    .foregroundColor(.white)
                
                Image(systemName: "house")
                    .resizable()
                    .scaledToFit()
                    .frame(width: 60, height: 60)
                    .foregroundColor(.white.opacity(0.7))
                    .padding(.top, 25)
                    .shadow(color: .white, radius: 5)
            }
            .padding(.top, 60)
            
            VStack {
                Text("Devices")
                    .font(.title2)
                    .foregroundColor(.white)
                    .padding(.top, 10)
                
                LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 20) {
                    DeviceButton(icon: "circle.circle", label: "Detector", destination: DetectorView())
                    DeviceButton(icon: "camera", label: "Camera", destination: CameraView())
                }
                .padding()
                .padding(.bottom, 15)
            }.padding(.top,15)
                .background(Color("DarkGreen"))
                .cornerRadius(25)

            
            Spacer()
        }
        .padding()
        .background(Color("DeepGreen"))
        .ignoresSafeArea()
    }
}


struct HomeView_Previews: PreviewProvider {
    static var previews: some View {
        HomeView()
    }
}

