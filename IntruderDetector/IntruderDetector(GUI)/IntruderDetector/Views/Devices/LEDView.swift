import SwiftUI

struct LEDView: View {
    @StateObject private var ledModel = LEDModel()
    var body: some View {
        VStack(spacing: 30) {
            VStack(spacing: 10) {
                Text("LED View")
                    .font(.title)
                    .italic()
                    .bold()
                    .foregroundColor(.white)

                Image(systemName: "lightbulb")
                    .resizable()
                    .scaledToFit()
                    .frame(width: 60, height: 60)
                    .foregroundColor(.white.opacity(0.7))
                    .padding(.top, 25)
                    .shadow(color: .white, radius: 5)
            }.padding(.top,80)

            VStack {
                Text("Flashing Rate\n(time/second)")
                    .font(.title2)
                    .bold()                     .foregroundColor(.white)

                LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 25) {
                    FunctionButton(label: "2/s", isActive: ledModel.flashingTimes == 2) {
                        ledModel.updateFlashingFunction(newFlashingTimes: 2)
                    }
                    FunctionButton(label: "3/s", isActive: ledModel.flashingTimes == 3, action: {
                        ledModel.updateFlashingFunction(newFlashingTimes: 3)
                    })
                    FunctionButton(label: "4/s", isActive: ledModel.flashingTimes == 4, action: {
                        ledModel.updateFlashingFunction(newFlashingTimes: 4)
                    })
                    FunctionButton(label: "5/s", isActive: ledModel.flashingTimes == 5) {
                        ledModel.updateFlashingFunction(newFlashingTimes: 5)
                    }
                }
                .padding()
                .padding(.bottom,15)
            }.padding(.top,30) 
                .background(Color("DarkGreen"))
                .cornerRadius(25)

            Spacer()
        }
        .padding()
        .background(Color("DeepGreen"))
        .ignoresSafeArea()
        .onAppear {
            ledModel.getFlashingTimes()
        }
    }
}


struct LEDView_Previews: PreviewProvider {
    static var previews: some View {
        LEDView()
    }
}
