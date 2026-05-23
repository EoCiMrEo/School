import SwiftUI

struct CameraView: View {
    private let streamURL = AppConfig.streamURL

    var body: some View {
        VStack(spacing: 30) {
            VStack(spacing: 10) {
                Text("Security Camera")
                    .font(.title)
                    .italic()
                    .bold()
                    .foregroundColor(.white)

                Image(systemName: "camera")
                    .resizable()
                    .scaledToFit()
                    .frame(width: 60, height: 60)
                    .foregroundColor(.white.opacity(0.7))
                    .padding(.top, 25)
                    .shadow(color: .white, radius: 5)
            }.padding(.top,80)

            VStack {
                Text("Streaming")
                    .font(.title2)
                    .bold()
                    .foregroundColor(.white)

                if let streamURL {
                    WebView(url: streamURL)
                        .frame(width: 300, height: 200)
                        .cornerRadius(12)
                        .overlay(RoundedRectangle(cornerRadius: 12).stroke(Color.blue, lineWidth: 2))
                        .shadow(radius: 5)
                        .padding(.horizontal, 31)
                        .padding(.bottom,35)
                } else {
                    Text("Invalid stream URL configuration")
                        .foregroundColor(.white)
                        .padding(.bottom, 35)
                }
            }.padding(.top,30)
                .background(Color("DarkGreen"))
                .cornerRadius(25)

            Spacer()
        }
        .padding()
        .background(Color("DeepGreen"))
        .ignoresSafeArea()
    }
}


struct CameraView_Previews: PreviewProvider {
    static var previews: some View {
        CameraView()
    }
}
