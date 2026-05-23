import SwiftUI

enum AppConfig {
    static let backendHost = ProcessInfo.processInfo.environment["BACKEND_HOST"] ?? "127.0.0.1"

    static func apiURL(path: String) -> URL? {
        URL(string: "http://\(backendHost):5000\(path)")
    }

    static var streamURL: URL? {
        URL(string: "http://\(backendHost):8000/stream.mjpg")
    }
}

class AuthModel: ObservableObject {
    @Published var isAuthenticated: Bool = false
    @Published var alertMessage: String = ""
    @Published var showLoginAlert: Bool = false
    @Published var showAlert: Bool = false

    func login(email: String, password: String, completion: @escaping (Result<String, Error>) -> Void) {
        guard let url = AppConfig.apiURL(path: "/login") else {
            completion(.failure(NSError(domain: "Invalid URL", code: -1000)))
            return
        }

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        let user = User(email: email, password: password)
        request.httpBody = try? JSONEncoder().encode(user)

        URLSession.shared.dataTask(with: request) { data, response, error in
            DispatchQueue.main.async {
                if let error = error {
                    self.alertMessage = "Network error: \(error.localizedDescription)"
                    self.showLoginAlert = true
                    self.isAuthenticated = false
                    completion(.failure(error))
                    return
                }

                guard let httpResponse = response as? HTTPURLResponse else {
                    self.alertMessage = "Invalid response from server."
                    self.showLoginAlert = true
                    self.isAuthenticated = false
                    completion(.failure(NSError(domain: "Invalid response", code: -1)))
                    return
                }

                guard let data = data else {
                    self.alertMessage = "No data received."
                    self.showLoginAlert = true
                    self.isAuthenticated = false
                    completion(.failure(NSError(domain: "No data", code: -2)))
                    return
                }

                do {
                    let json = try JSONSerialization.jsonObject(with: data, options: []) as? [String: Any]
                    print("HTTP Res Code: \(httpResponse.statusCode)")
                    if httpResponse.statusCode == 200 {
                        let message = json?["message"] as? String ?? "Login successful."
                        self.alertMessage = message
                        self.showLoginAlert = false
                        self.isAuthenticated = true
                        completion(.success(message))
                    } else {
                        let errorMessage = json?["error"] as? String ?? "Unknown error"
                        self.alertMessage = errorMessage
                        self.showLoginAlert = true
                        self.isAuthenticated = false
                        completion(.failure(NSError(domain: errorMessage, code: httpResponse.statusCode)))
                    }
                } catch {
                    self.alertMessage = "Failed to parse server response."
                    self.showLoginAlert = true
                    self.isAuthenticated = false
                    completion(.failure(error))
                }
            }
        }.resume()
    }


    func register(email: String, password: String, completion: (() -> Void)? = nil) {
        guard let url = AppConfig.apiURL(path: "/register") else { return }

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        let user = User(email: email, password: password)
        request.httpBody = try? JSONEncoder().encode(user)

        URLSession.shared.dataTask(with: request) { data, response, error in
            DispatchQueue.main.async {
                if let error = error {
                    self.alertMessage = error.localizedDescription
                    self.showAlert = true
                    completion?()
                    return
                }

                guard let httpResponse = response as? HTTPURLResponse,
                      let data = data else {
                    self.alertMessage = "Invalid response or no data."
                    self.showAlert = true
                    completion?()
                    return
                }

                do {
                    let json = try JSONSerialization.jsonObject(with: data) as? [String: Any]
                    if httpResponse.statusCode == 200 {
                        self.alertMessage = json?["message"] as? String ?? "Registration successful!"
                        self.showAlert = true
                    } else {
                        self.alertMessage = json?["error"] as? String ?? "Registration failed."
                        self.showAlert = true
                    }
                } catch {
                    self.alertMessage = "Failed to parse response."
                    self.showAlert = true
                }
                completion?()
            }
        }.resume()
    }

    func logout() {
        isAuthenticated = false
    }
}
