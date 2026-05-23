import SwiftUI

struct NavigatorButton: View {
    let icon: String
    let label: String
    var action: () -> Void
    
    var body: some View {
        Button(action: action) {
            VStack(spacing: 10) {
                Image(systemName: icon)
                    .resizable()
                    .scaledToFit()
                    .frame(height: 30)
                Text(label)
                    .font(.subheadline)
            }
            .frame(maxWidth: .infinity, minHeight: 80)
            .background(Color(.systemGray5))
            .foregroundColor(.black)
            .cornerRadius(20)
        }
        .buttonStyle(ScaleButtonStyle())
    }
}
