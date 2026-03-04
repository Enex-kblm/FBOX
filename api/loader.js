const loaderScript = `
local player = game.Players.LocalPlayer
local SERVER_URL = "https://fbox-alpha.vercel.app"

local function generatePairingCode()
    local letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    local numbers = "0123456789"
    local code = ""
    
    for i = 1, 3 do
        local rand = math.random(1, #letters)
        code = code .. string.sub(letters, rand, rand)
    end
    
    code = code .. "-"
    
    for i = 1, 2 do
        local rand = math.random(1, #numbers)
        code = code .. string.sub(numbers, rand, rand)
    end
    
    return code
end

local PAIRING_CODE = generatePairingCode()

print("╔════════════════════════════╗")
print("║    F-BOX LOADER v2.0       ║")
print("╠════════════════════════════╣")
print("║ Player: " .. player.Name)
print("║ Pairing Code: " .. PAIRING_CODE)
print("║ Server: " .. SERVER_URL)
print("╚════════════════════════════╝")

local function register()
    local data = {
        pairingCode = PAIRING_CODE,
        playerName = player.Name,
        playerId = tostring(player.UserId)
    }
    
    local jsonData = game:GetService("HttpService"):JSONEncode(data)
    
    local success, response = pcall(function()
        return request({
            Url = SERVER_URL .. "/api/register",
            Method = "POST",
            Headers = {["Content-Type"] = "application/json"},
            Body = jsonData
        })
    end)
    
    if success and response.StatusCode == 200 then
        print("✅ Registered! Code: " .. PAIRING_CODE)
        print("🔐 Login: " .. SERVER_URL .. "/login.html")
        return true
    else
        print("❌ Gagal register. Status: " .. (response and response.StatusCode or "?"))
        return false
    end
end

local function getCommand()
    local success, response = pcall(function()
        return request({
            Url = SERVER_URL .. "/api/command",
            Method = "GET"
        })
    end)
    
    if success and response.StatusCode == 200 then
        return response.Body
    end
    return nil
end

if register() then
    print("📡 Menunggu command...")
    
    while true do
        local command = getCommand()
        
        if command and command ~= "null" then
            print("📥 Command diterima!")
            local func = loadstring(command)
            if func then
                local success = pcall(func)
                print(success and "✅ Sukses" or "❌ Gagal")
            end
        end
        
        wait(2)
    end
else
    print("❌ Gagal register, cek koneksi")
end
`;

module.exports = (req, res) => {
    res.setHeader('Content-Type', 'text/plain');
    res.send(loaderScript);
};