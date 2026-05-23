import SwiftUI

enum Tab {
    case camera, setting, detector, home}

struct TabNavigatorView: View {
    @State var selectedTab: Tab?
    var body: some View {
        VStack(spacing: 0) {
            // Main content area
            ZStack {
                switch selectedTab {
                    case .home:
                        HomeView()
                    case .detector:
                        DetectorView()
                    case .camera:
                        CameraView()
                    case .setting:
                        SettingsView()
                    case .none:
                        EmptyView()
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)

            // Custom horizontal button bar
            HStack {
                TabButton(label: "Home", icon: "house", isSelected: selectedTab == .home) {
                    selectedTab = .home
                }
                TabButton(label: "Detector", icon: "circle.circle", isSelected: selectedTab == .detector) {
                    selectedTab = .detector
                }
                TabButton(label: "Camera", icon: "camera", isSelected: selectedTab == .camera) {
                    selectedTab = .camera
                }
                TabButton(label: "Setting", icon: "gear", isSelected: selectedTab == .setting) {
                    selectedTab = .setting
                }
            }
            .padding()
            .background(Color.white.opacity(0.95))
            .shadow(radius: 5)
        }
        .edgesIgnoringSafeArea(.bottom)
    }
}

struct TabNavigator_Previews: PreviewProvider {
    static var previews: some View {
        TabNavigatorView()
    }
}
