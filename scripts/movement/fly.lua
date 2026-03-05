-- FLY SCRIPT - TOGGLE VERSION
local player = game.Players.LocalPlayer
local flying = false

local function flyOn()
    if flying then return end
    local char = player.Character
    if not char then return end
    
    local root = char:FindFirstChild("HumanoidRootPart")
    if not root then return end
    
    local bv = Instance.new("BodyVelocity")
    bv.MaxForce = Vector3.new(1000000, 1000000, 1000000)
    bv.Velocity = Vector3.new(0, 0, 0)
    bv.Parent = root
    
    flying = true
    print("✅ Fly ON")
    
    -- Loop movement
    coroutine.wrap(function()
        local ui = game:GetService("UserInputService")
        while flying do
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

local function flyOff()
    if not flying then return end
    local char = player.Character
    if char then
        local root = char:FindFirstChild("HumanoidRootPart")
        if root then
            local bv = root:FindFirstChild("BodyVelocity")
            if bv then bv:Destroy() end
        end
    end
    flying = false
    print("❌ Fly OFF")
end

-- Export fungsi global
_G.fly = {
    on = flyOn,
    off = flyOff,
    toggle = function()
        if flying then flyOff() else flyOn() end
    end,
    status = function() return flying end
}

player.CharacterAdded:Connect(function()
    flying = false
end)

print("✅ Fly script loaded - Use _G.fly.on() / _G.fly.off()")