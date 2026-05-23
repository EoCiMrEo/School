import Foundation

class PIRModel: ObservableObject {
    @Published var sensitivityLevel: Int = 1
    @Published var isActive: Bool?
    @Published var errorMessage: String?
    
    func modifySensitivity(level: Int) {
        // 1. Set your Flask API URL
        sensitivityLevel = level
        guard let url = AppConfig.apiURL(path: "/modifySensitivity") else {
            print("Invalid URL")
            return
        }
        
        // 2. Prepare the request
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        // 3. Body data
        let body: [String: Int] = ["newSensitivityLevel": sensitivityLevel]
        request.httpBody = try? JSONSerialization.data(withJSONObject: body)
        
        // 4. Perform the request
        URLSession.shared.dataTask(with: request) { data, response, error in
            if let error = error {
                print("Error: \(error.localizedDescription)")
                return
            }
            
            guard let httpResponse = response as? HTTPURLResponse else {
                print("Invalid response")
                return
            }
            
            print("Status Code: \(httpResponse.statusCode)")
            
            if let data = data {
                if let jsonString = String(data: data, encoding: .utf8) {
                    print("Response: \(jsonString)")
                }
            }
        }.resume()
    }
    
    func getSensitivityLevel() {
        guard let url = AppConfig.apiURL(path: "/getSensitivityLevel") else {
            print("Invalid URL")
            return
        }

        let task = URLSession.shared.dataTask(with: url) { data, response, error in
            if let error = error {
                print("Error fetching sensitivity level: \(error)")
                return
            }

            guard let data = data else {
                print("No data received")
                return
            }

            do {
                let decoded = try JSONDecoder().decode([SensitivityResponse].self, from: data)
                if let level = decoded.first?.sensitivityLevel {
                    DispatchQueue.main.async {
                        self.sensitivityLevel = level
                        print("Fetched sensitivity level: \(level)")
                    }
                } else {
                    print("No sensitivity level found in response")
                }
            } catch {
                print("Decoding error: \(error)")
            }
        }
        task.resume()
    }

}


struct SensitivityResponse: Codable {
    let sensitivityLevel: Int
}
