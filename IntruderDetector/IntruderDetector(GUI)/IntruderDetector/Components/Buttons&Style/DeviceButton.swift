import SwiftUI

struct DeviceButton<Destination: View>: View {
    let icon: String
    let label: String
    let destination: Destination

    var body: some View {
        NavigationLink(destination: destination) {
            VStack(spacing: 8) {
                Image(systemName: icon)
                    .resizable()
                    .scaledToFit()
                    .frame(width: 30, height: 30)
                    .foregroundColor(.black)

                Text(label)
                    .font(.subheadline)
                    .foregroundColor(.black)
            }
            .frame(width: 120, height: 100)
            .background(Color(.systemGray5))
            .cornerRadius(25)
            .shadow(radius: 3)
        }
        .buttonStyle(ScaleButtonStyle())
    }
}
