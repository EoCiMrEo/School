import SwiftUI

struct PIRMotionView: View {
    @StateObject private var pirModel = PIRModel()
    
    var body: some View {
        VStack(spacing: 30) {
            VStack(spacing: 10) {
                Text("PIR Motion")
                    .font(.title)
                    .italic()
                    .bold()
                    .foregroundColor(.white)
                
                Image(systemName: "arrow.up.and.down.and.arrow.left.and.right")
                    .resizable()
                    .scaledToFit()
                    .frame(width: 60, height: 60)
                    .foregroundColor(.white.opacity(0.7))
                    .padding(.top, 25)
                    .shadow(color: .white, radius: 5)
            }
            .padding(.top, 80)
            
            VStack {
                Text("Sensitivity Levels")
                    .font(.title2)
                    .bold()
                    .foregroundColor(.white)
                
                LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 25) {
                    FunctionButton(label: "HIGH", isActive: pirModel.sensitivityLevel == 1) {
                        pirModel.modifySensitivity(level: 1)
                    }
                    FunctionButton(label: "MEDIUM", isActive: pirModel.sensitivityLevel == 2) {
                        pirModel.modifySensitivity(level: 2)
                    }
                    FunctionButton(label: "NORMAL", isActive: pirModel.sensitivityLevel == 3) {
                        pirModel.modifySensitivity(level: 3)
                    }
                    FunctionButton(label: "LOW", isActive: pirModel.sensitivityLevel == 4) {
                        pirModel.modifySensitivity(level: 4)
                    }
                }
                .padding()
                .padding(.bottom, 15)
            }
            .padding(.top, 30)
            .background(Color("DarkGreen"))
            .cornerRadius(25)
            
            Spacer()
        }
        .padding()
        .background(Color("DeepGreen"))
        .ignoresSafeArea()
        .onAppear {
            pirModel.getSensitivityLevel()
        }
    }
}


struct PIRMotionView_Previews: PreviewProvider {
    static var previews: some View {
        PIRMotionView()
    }
}



