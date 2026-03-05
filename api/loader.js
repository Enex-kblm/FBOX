const loaderScript = `
-- F-BOX LOADER - COMPLETE VERSION
local player = game.Players.LocalPlayer
local SERVER_URL = "https://fbox-alpha.vercel.app"

-- ========== GENERATE PAIRING CODE ==========
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

-- ========== REGISTER ==========
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
end

register()

-- ========== FLY SCRIPT ==========
_G.fly = _G.fly or {}
_G.fly.active = false

_G.fly.on = function()
    if _G.fly.active then return end
    local char = player.Character
    if not char then return end
    local root = char:FindFirstChild("HumanoidRootPart")
    if not root then return end
    
    local bv = Instance.new("BodyVelocity")
    bv.MaxForce = Vector3.new(1000000, 1000000, 1000000)
    bv.Velocity = Vector3.new(0, 0, 0)
    bv.Parent = root
    _G.fly.active = true
    print("✅ Fly ON")
    
    coroutine.wrap(function()
        local ui = game:GetService("UserInputService")
        while _G.fly.active do
            local move = Vector3.new(0, 0, 0)
            if ui:IsKeyDown(Enum.KeyCode.W) then
                move = move + workspace.CurrentCamera.CFrame.LookVector
            end
            if ui:IsKeyDown(Enum.KeyCode.S) then
                move = move - workspace.CurrentCamera.CFrame.LookVector
            end
            if ui:IsKeyDown(Enum.KeyCode.A) then
                move = move - workspace.CurrentCamera.CFrame.RightVector
            end
            if ui:IsKeyDown(Enum.KeyCode.D) then
                move = move + workspace.CurrentCamera.CFrame.RightVector
            end
            if ui:IsKeyDown(Enum.KeyCode.Space) then
                move = move + Vector3.new(0, 1, 0)
            end
            if ui:IsKeyDown(Enum.KeyCode.LeftShift) then
                move = move - Vector3.new(0, 1, 0)
            end
            bv.Velocity = move * 50
            wait(0.1)
        end
    end)()
end

_G.fly.off = function()
    if not _G.fly.active then return end
    _G.fly.active = false
    local char = player.Character
    if char then
        local root = char:FindFirstChild("HumanoidRootPart")
        if root then
            local bv = root:FindFirstChild("BodyVelocity")
            if bv then bv:Destroy() end
        end
    end
    print("❌ Fly OFF")
end

_G.fly.toggle = function()
    if _G.fly.active then _G.fly.off() else _G.fly.on() end
end

-- ========== ESP SCRIPT ==========
_G.esp = _G.esp or {}
_G.esp.active = false
_G.esp.objects = {}

_G.esp.on = function()
    if _G.esp.active then return end
    _G.esp.active = true
    print("✅ ESP ON")
    
    coroutine.wrap(function()
        while _G.esp.active do
            for _, v in pairs(game.Players:GetPlayers()) do
                if v ~= player and v.Character and v.Character:FindFirstChild("Head") then
                    if not v.Character:FindFirstChild("ESP_Highlight") then
                        local hl = Instance.new("Highlight")
                        hl.Name = "ESP_Highlight"
                        hl.Parent = v.Character
                        hl.FillColor = Color3.new(1, 0, 0)
                        hl.FillTransparency = 0.5
                        
                        local billboard = Instance.new("BillboardGui")
                        billboard.Name = "ESP_Name"
                        billboard.Parent = v.Character.Head
                        billboard.Size = UDim2.new(0, 200, 0, 50)
                        billboard.StudsOffset = Vector3.new(0, 3, 0)
                        
                        local label = Instance.new("TextLabel")
                        label.Parent = billboard
                        label.Size = UDim2.new(1, 0, 1, 0)
                        label.BackgroundTransparency = 1
                        label.Text = v.Name
                        label.TextColor3 = Color3.new(1, 1, 1)
                        label.TextScaled = true
                        
                        table.insert(_G.esp.objects, {hl, billboard})
                    end
                end
            end
            wait(1)
        end
    end)()
end

_G.esp.off = function()
    if not _G.esp.active then return end
    _G.esp.active = false
    for _, objPair in pairs(_G.esp.objects) do
        for _, obj in pairs(objPair) do
            if obj and obj.Parent then obj:Destroy() end
        end
    end
    _G.esp.objects = {}
    print("❌ ESP OFF")
end

_G.esp.toggle = function()
    if _G.esp.active then _G.esp.off() else _G.esp.on() end
end

-- ========== UI ==========
local function copyToClipboard(text)
    pcall(function() setclipboard(text) end)
end

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
closeBtn.MouseButton1Click:Connect(function() screenGui:Destroy() end)

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
codeBtn.MouseButton1Click:Connect(function()
    copyToClipboard(PAIRING_CODE)
    codeBtn.Text = "✅ Copied!"
    wait(1)
    codeBtn.Text = "📋 " .. PAIRING_CODE
end)

local urlBtn = Instance.new("TextButton")
urlBtn.Size = UDim2.new(1, -20, 0, 30)
urlBtn.Position = UDim2.new(0, 10, 0, 75)
urlBtn.BackgroundColor3 = Color3.fromRGB(40, 40, 50)
urlBtn.Text = "🔗 Login Page"
urlBtn.TextColor3 = Color3.fromRGB(100, 200, 255)
urlBtn.TextScaled = true
urlBtn.Font = Enum.Font.Gotham
urlBtn.Parent = mainFrame
urlBtn.MouseButton1Click:Connect(function()
    copyToClipboard(LOGIN_URL)
    urlBtn.Text = "✅ Copied!"
    wait(1)
    urlBtn.Text = "🔗 Login Page"
end)

print("✅ F-BOX Loaded - Code: " .. PAIRING_CODE)

-- ========== COMMAND LOOP ==========
print("📡 Menunggu command...")

while true do
    local success, response = pcall(function()
        return request({
            Url = SERVER_URL .. "/api/command",
            Method = "GET"
        })
    end)
    
    if success and response.StatusCode == 200 and response.Body and response.Body ~= "null" then
        print("📥 Command diterima: " .. response.Body)
        local func, err = loadstring(response.Body)
        if func then
            local ok, result = pcall(func)
            if ok then
                print("✅ Sukses")
            else
                print("❌ Error: " .. tostring(result))
            end
        else
            print("❌ Loadstring error: " .. tostring(err))
        end
    end
    wait(2)
end
`;

module.exports = (req, res) => {
    res.setHeader('Content-Type', 'text/plain');
    res.send(loaderScript);
};