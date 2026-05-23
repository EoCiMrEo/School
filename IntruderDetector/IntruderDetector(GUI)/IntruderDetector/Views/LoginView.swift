import SwiftUI

struct LoginView: View {
    @State private var email = ""
    @State private var password = ""
    @EnvironmentObject var authModel: AuthModel
    
    var body: some View {
        NavigationView {
            VStack(spacing: 25) {
                Spacer()
                
                Text("Login")
                    .font(.largeTitle)
                    .fontWeight(.bold)
                    .foregroundColor(.blue)
                
                TextField("Email", text: $email)
                    .keyboardType(.emailAddress)
                    .textContentType(.emailAddress)
                    .autocapitalization(.none)
                    .padding()
                    .background(Color.white.opacity(0.9))
                    .cornerRadius(12)
                    .shadow(color: .gray.opacity(0.3), radius: 5, x: 0, y: 4)
                    .padding(.horizontal)
                
                SecureField("Password", text: $password)
                    .padding()
                    .textContentType(.password)
                    .background(Color.white.opacity(0.9))
                    .cornerRadius(12)
                    .shadow(color: .gray.opacity(0.3), radius: 5, x: 0, y: 4)
                    .padding(.horizontal)
                
                Button(action: {
                    authModel.login(email: email, password: password) { _ in }
                }) {
                    Text("Login")
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.blue.opacity(0.8))
                        .foregroundColor(.white)
                        .cornerRadius(10)
                        .padding(.horizontal)
                }
                .alert(isPresented: $authModel.showLoginAlert) {
                    Alert(title: Text("Login"), message: Text(authModel.alertMessage), dismissButton: .default(Text("OK")))
                }
                
                Button(action: {
                    authModel.register(email: email, password: password)
                }) {
                    Text("Register")
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.green.opacity(0.8))
                        .foregroundColor(.white)
                        .cornerRadius(10)
                        .padding(.horizontal)
                }
                .alert(isPresented: $authModel.showAlert) {
                    Alert(title: Text("Register"), message: Text(authModel.alertMessage), dismissButton: .default(Text("OK")))
                }

                Spacer()
                
                NavigationLink(
                    destination: TabNavigatorView(selectedTab: .home),
                    isActive: $authModel.isAuthenticated
                ) {
                    EmptyView()
                }
                .hidden()
            }
            .padding()
            .background(LinearGradient(gradient: Gradient(colors: [.white, .blue.opacity(0.1)]), startPoint: .top, endPoint: .bottom))
            .ignoresSafeArea()
        }
    }
}


struct LoginView_Previews: PreviewProvider {
    static var previews: some View {
        LoginView()
    }
}
