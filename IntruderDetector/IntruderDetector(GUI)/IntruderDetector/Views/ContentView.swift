import SwiftUI

struct ContentView: View {
    @State private var progress: Double = 0.0
    @State private var isLoading: Bool = false
    @StateObject private var authModel = AuthModel()
    var body: some View {
        Group {
            if progress < 100 {
                LoadingView(progress: $progress)
            } else {
                LoginView()
                    .environmentObject(authModel)
            }
        }.onAppear {
            DispatchQueue.main.asyncAfter(deadline: .now()) {
                isLoading = false
            }
        }
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}
