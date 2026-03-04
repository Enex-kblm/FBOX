-- ESP Script
for _, v in pairs(game.Players:GetPlayers()) do
    if v ~= game.Players.LocalPlayer and v.Character and v.Character:FindFirstChild("Head") then
        local highlight = Instance.new("Highlight")
        highlight.Parent = v.Character
        highlight.FillColor = Color3.new(1, 0, 0)
        highlight.FillTransparency = 0.5
        
        local billboard = Instance.new("BillboardGui")
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
    end
end
print("✅ ESP Activated")