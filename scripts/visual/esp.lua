-- ESP TOGGLE SCRIPT
local player = game.Players.LocalPlayer

_G.esp = _G.esp or {}
_G.esp.active = false
_G.esp.objects = {}

_G.esp.on = function()
    if _G.esp.active then return end
    
    _G.esp.active = true
    print("✅ ESP ON")
    
    -- Loop buat update ESP
    coroutine.wrap(function()
        while _G.esp.active do
            for _, v in pairs(game.Players:GetPlayers()) do
                if v ~= player and v.Character and v.Character:FindFirstChild("Head") then
                    -- Cek udah ada highlight belum
                    local highlight = v.Character:FindFirstChild("ESP_Highlight")
                    if not highlight then
                        -- ESP Box
                        local hl = Instance.new("Highlight")
                        hl.Name = "ESP_Highlight"
                        hl.Parent = v.Character
                        hl.FillColor = Color3.new(1, 0, 0)
                        hl.FillTransparency = 0.5
                        hl.OutlineColor = Color3.new(1, 1, 1)
                        
                        -- ESP Name
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
                        label.Font = Enum.Font.SourceSansBold
                        
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
    
    -- Hapus semua ESP objects
    for _, objPair in pairs(_G.esp.objects) do
        for _, obj in pairs(objPair) do
            if obj and obj.Parent then
                obj:Destroy()
            end
        end
    end
    _G.esp.objects = {}
    print("❌ ESP OFF")
end

_G.esp.toggle = function()
    if _G.esp.active then
        _G.esp.off()
    else
        _G.esp.on()
    end
end

print("✅ ESP script loaded - Use _G.esp.on() / _G.esp.off()")