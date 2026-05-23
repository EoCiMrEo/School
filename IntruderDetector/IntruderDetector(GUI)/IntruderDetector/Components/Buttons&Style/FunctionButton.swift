//import Foundation
//import SwiftUI
//
//struct FunctionButton: View {
//    let label: String
//    var action: () -> Void
//
//    var body: some View {
//        Button(action: action) {
//            VStack(spacing: 10) {
//                Text(label)
//                    .font(.headline)
//            }
//            .frame(maxWidth: .infinity, minHeight: 80)
//            .background(Color(.systemGray5))
//            .foregroundColor(.black)
//            .cornerRadius(20)
//        }
//        .buttonStyle(ScaleButtonStyle())
//    }
//}
//
//struct FunctionButton_Previews: PreviewProvider {
//    static var previews: some View {
//        FunctionButton(label: "Flash 1/s") {
//        }
//    }
//}

import SwiftUI

struct FunctionButton: View {
    let label: String
    var isActive: Bool
    var action: () -> Void

    var body: some View {
        Button(action: action) {
            ZStack(alignment: .topTrailing) {
                VStack(spacing: 10) {
                    Text(label)
                        .font(.title2)
                }
                .frame(width: 130, height: 100)
                .background(Color(.systemGray5))
                .foregroundColor(.black)
                .cornerRadius(20)

                // 🔵 Status Circle
                Circle()
                    .fill(isActive ? Color.green : Color.green.opacity(0.2))
                    .frame(width: 14, height: 14)
                    .padding(8)
            }
        }
        .buttonStyle(ScaleButtonStyle())
    }
}
