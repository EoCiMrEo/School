import Foundation


class LEDModel: ObservableObject {
    @Published var flashingTimes: Int = 2
    @Published var isActive: Bool?
    @Published var duration = 5
    
    func updateFlashingFunction(newFlashingTimes: Int) {
        // 1. Set your Flask API URL
        flashingTimes = newFlashingTimes
        guard let url = AppConfig.apiURL(path: "/modifyFlashingFunction") else {
            print("Invalid URL")
            return
        }

        // 2. Prepare the request
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        // 3. Body data
        let body: [String: Int] = ["newTimesPerSecond": flashingTimes]
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
    
    func getFlashingTimes() {
        guard let url = AppConfig.apiURL(path: "/getFlashingTimes") else {
            print("Invalid URL")
            return
        }

        let task = URLSession.shared.dataTask(with: url) { data, response, error in
            if let error = error {
                print("Error fetching flashing times: \(error)")
                return
            }

            guard let data = data else {
                print("No data received")
                return
            }

            do {
                let decoded = try JSONDecoder().decode([LEDResponse].self, from: data)
                if let level = decoded.first?.flashTimesPerSecond {
                    DispatchQueue.main.async {
                        self.flashingTimes = level
                        print("Fetched flashing times: \(level)")
                    }
                } else {
                    print("No flashing data found in response")
                }
            } catch {
                print("Decoding error: \(error)")
            }
        }
        task.resume()
    }
}

struct LEDResponse: Codable {
    let flashTimesPerSecond: Int
}
