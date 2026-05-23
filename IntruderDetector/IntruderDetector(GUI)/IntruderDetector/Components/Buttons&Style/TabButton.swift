import SwiftUI

struct TabButton: View {
    let label: String
    let icon: String
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            VStack {
                Image(systemName: icon)
                    .font(.title2)
                Text(label)
                    .font(.caption)
            }
            .padding(5)
            .foregroundColor(isSelected ? .blue : .gray)
            .background(isSelected ? Color.blue.opacity(0.15) : Color.clear)
            .cornerRadius(10)
        }
        .frame(maxWidth: .infinity)
    }
}
