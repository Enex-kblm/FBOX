-- FLY TOGGLE SCRIPT
local player = game.Players.LocalPlayer

_G.fly = _G.fly or {}
_G.fly.active = false

_G.fly.on = function()
    if _G.fly.active then return end
    
    local char = player.Character
    if not char then 
        print("❌ Fly: No character")
        return 
    end
    
    local root = char:FindFirstChild("HumanoidRootPart")
    if not root then 
        print("❌ Fly: No root part")
        return 
    end
    
    -- Hapus kalo udah ada
    local old = root:FindFirstChild("BodyVelocity")
    if old then old:Destroy() end
    
    local bv = Instance.new("BodyVelocity")
    bv.MaxForce = Vector3.new(1000000, 1000000, 1000000)
    bv.Velocity = Vector3.new(0, 0, 0)
    bv.Parent = root
    
    _G.fly.active = true
    print("✅ Fly ON")
    
    -- Movement loop
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
    if _G.fly.active then
        _G.fly.off()
    else
        _G.fly.on()
    end
end

-- Matiin kalo character respawn
player.CharacterAdded:Connect(function()
    _G.fly.active = false
end)

print("✅ Fly script loaded - Use _G.fly.on() / _G.fly.off()")