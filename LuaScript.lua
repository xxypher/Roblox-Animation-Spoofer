local Mode = "Explorer Selection" -- SELECT ALL THE ANIMATIONS IN THE EXPLORER FOR THEM TO WORK

local myCookie = "" --INSERT YOUR ROBLOX COOKIE IN HERE
local Key = "NOIPLOGGER" -- DONT REPLACE THIS. THIS IS FOR THE PROXY 

local TableSpoof = {}

local GroupID = nil -- PUT YOUR GROUP'S ID IF YOUR GAME IS UNDER A GROUP (default: nil)
local UserID = nil -- PUT YOUR USER ID IF YOUR GAME IS UNDER A PLAYER (default: nil)

local ScriptToSpoofPath = nil

for i,v in pairs(workspace:GetDescendants()) do if v:IsA("PackageLink") then v:Destroy() end end

local MarketplaceService = game:GetService("MarketplaceService")

local function SendPOST(ids: {any}, cookie: string?, port: string?, key: string?)
	game:GetService("HttpService"):PostAsync("http://127.0.0.1:"..port.."/", game:GetService("HttpService"):JSONEncode({["ids"]=ids, ["cookie"]=cookie and cookie or nil, ["key"]=key and key or "", ["groupID"] = GroupID and GroupID or nil}))
end

local Modes = {
	Help = "Returns this help guide!",
	Normal = "Begins stealing all animations with no filter whatsoever.",
	SAS = "Steals all animations inside scripts, reuploads them and changes the old IDs for the new ones in the scripts themselves",
	SSS = "Steals all animations in a specific script, reuploads them and changes the old IDs for the new ones in the script itself",
	["Explorer Selection"] = "Only steals animations that are selected in the Roblox Studio's Explorer.",
	["Table Spoof"] = "Only steals animations IDs that you put in the \"TableSpoof\" variable",
	["Table Spoof and Return 1"] = "Only steals animations IDs that you put in the \"TableSpoof\" variable, and returns a table with the IDs without actually changing them in-game (DOESN'T return with rbxassetid://)",
	["Table Spoof and Return 2"] = "Only steals animations IDs that you put in the \"TableSpoof\" variable, and returns a table with the IDs without actually changing them in-game (DOES return with rbxassetid://)",
}

game:GetService("HttpService").HttpEnabled = true

local function PollForResponse(port): {any}
	local response

	while not response and task.wait(4) do
		response = game:GetService("HttpService"):JSONDecode(game:GetService("HttpService"):GetAsync("http://127.0.0.1:"..port.."/"))
	end

	return response
end

local function ReturnUUID(): {any}
	return tostring(game:GetService("HttpService"):GenerateGUID())
end
local CorrectNumbers 

local ids = {}

local function SpoofTable(Table)
	for index,v in Table do
		local anim = v

		if type(v) == "number" or type(v) == "string" then
			anim = {AnimationId = tostring(v), Name = index}
		elseif anim.ClassName then
			if not anim:IsA("Animation") then
				continue
			end
		end

		if not anim or tonumber(anim.AnimationId:match("%d+")) == nil or string.len(anim.AnimationId:match("%d+")) <= 6 then continue end

		local foundAnimInTable = false

		for _,x in ids do
			if x == anim.AnimationId:match("%d+") then
				foundAnimInTable = true
			end
		end

		if foundAnimInTable == true then continue end

		if GroupID and MarketplaceService:GetProductInfo(anim.AnimationId:match("%d+"), Enum.InfoType.Asset).Creator.CreatorTargetId == GroupID or MarketplaceService:GetProductInfo(anim.AnimationId:match("%d+"), Enum.InfoType.Asset).Creator.CreatorTargetId == UserID then continue end

		if Mode == "Table Spoof and Return 1" or Mode == "Table Spoof and Return 2" then
			ids[index] = anim.AnimationId:match("%d+")
		else
			ids[anim.Name..ReturnUUID()] = anim.AnimationId:match("%d+")
		end
	end

	return ids
end

local function SpoofScript(Path)
	local anims = {}

	if Path and Mode == "SSS" then
		local Source = Path.Source

		if not Source then warn("Script path invalid") return end

		local tableSource = {}

		for word in Source:gmatch("%S+") do
			table.insert(tableSource, word)
		end

		local i = 0

		for _, v in tableSource do
			if v and string.match(v, "%d+") and string.len(string.match(v, "%d+")) > 6 then
				local animId = ""

				for i,th in string.split(v, "") do
					if string.match(th, "%d") then
						animId = animId..th
					end
				end

				animId = tonumber(animId)

				if not anims[animId] and MarketplaceService:GetProductInfo(animId, Enum.InfoType.Asset).AssetTypeId == Enum.AssetType.Animation.Value then

					if GroupID and MarketplaceService:GetProductInfo(animId, Enum.InfoType.Asset).Creator.CreatorTargetId == GroupID or MarketplaceService:GetProductInfo(animId.AnimationId:match("%d+"), Enum.InfoType.Asset).Creator.CreatorTargetId == UserID then continue end

					anims[animId] = animId
				end
			end
		end
	else
		for _,script in game:GetDescendants() do
			if script:IsA("LuaSourceContainer") then
				local Source = script.Source

				if not Source then continue end

				local tableSource = {}

				for word in Source:gmatch("%S+") do
					table.insert(tableSource, word)
				end

				local i = 0

				for _, v in tableSource do
					if v and string.match(v, "%d+") and string.len(string.match(v, "%d+")) > 6 then
						local animId = ""

						for i,th in string.split(v, "") do
							if string.match(th, "%d") then
								animId = animId..th
							end
						end

						animId = tonumber(animId)

						if not anims[animId] and MarketplaceService:GetProductInfo(animId, Enum.InfoType.Asset).AssetTypeId == Enum.AssetType.Animation.Value then

							if GroupID and MarketplaceService:GetProductInfo(animId, Enum.InfoType.Asset).Creator.CreatorTargetId == GroupID or MarketplaceService:GetProductInfo(animId.AnimationId:match("%d+"), Enum.InfoType.Asset).Creator.CreatorTargetId == UserID then continue end

							anims[animId] = animId
						end
					end
				end
			end
		end
	end

	return anims
end

local function GenerateIDList(): {any}
	local ids = {}

	if Mode == "Normal" then
		ids = SpoofTable(game:GetDescendants())

	elseif Mode == "Explorer Selection" then
		ids = SpoofTable(game.Selection:Get())

	elseif Mode == "Table Spoof" then
		if not TableSpoof then warn("TableSpoof doesn't exist") return end

		ids = SpoofTable(TableSpoof)

	elseif Mode == "Table Spoof and Return 1" then
		if not TableSpoof then warn("TableSpoof doesn't exist") return end

		ids = SpoofTable(TableSpoof)

	elseif Mode == "Table Spoof and Return 2" then
		if not TableSpoof then warn("TableSpoof doesn't exist") return end

		ids = SpoofTable(TableSpoof)

	elseif Mode == "SAS" then

		ids = SpoofScript()

	elseif Mode == "SSS" then
		if not ScriptToSpoofPath then warn("Please insert the path to the script in the \"ScriptToSpoofPath\" variable") return end

		ids = SpoofScript(ScriptToSpoofPath)
	end

	return ids
end

if Mode == "Help" then
	for mod,desc in Modes do
		print(mod.." - "..desc)
	end

	return
end

local idsToGet = GenerateIDList()

SendPOST(idsToGet, myCookie, "6969", Key, GroupID)
local newIDList = PollForResponse("6969")

if Mode == "Table Spoof and Return 2" then
	for i,v in newIDList do
		newIDList[i] = "rbxassetid://"..v
	end
end

if Mode == "Table Spoof and Return 1" or Mode == "Table Spoof and Return 2" then
	print(newIDList)
	return
end

if Mode == "SAS" or Mode == "SSS" then
	for _,script in game:GetDescendants() do
		if script:IsA("Script") or script:IsA("ModuleScript") or script:IsA("LocalScript") then
			local Source = script.Source

			for old,new in newIDList do
				Source = string.gsub(Source, old, new)
			end

			game:GetService("ChangeHistoryService"):SetWaypoint("BeforeScriptUpdate")

			script.Source = Source
		end
	end
	return
end


for oldID,newID in newIDList do
	for _,v in game:GetDescendants() do
		if v:IsA("Animation") and string.find(v.AnimationId, tonumber(oldID)) then
			v.AnimationId = "rbxassetid://"..tostring(newID)
		end
	end
end
