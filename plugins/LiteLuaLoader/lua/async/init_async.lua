function tostringex(v, len)
	if len == nil then len = 0 end
	local pre = string.rep('\t', len)
	local ret = ""
	if type(v) == "table" then
	   if len > 5 then return "\t{ ... }" end
	   local t = ""
	   for k, v1 in pairs(v) do
		t = t .. "\n\t" .. pre .. tostring(k) .. ":"
		t = t .. tostringex(v1, len + 1)
	   end
	   if t == "" then
		ret = ret .. pre .. "{ }\t(" .. tostring(v) .. ")"
	   else
		if len > 0 then
		 ret = ret .. "\t(" .. tostring(v) .. ")\n"
		end
		ret = ret .. pre .. "{" .. t .. "\n" .. pre .. "}"
	   end
	else
	   ret = ret .. pre .. tostring(v) .. "\t(" .. type(v) .. ")"
	end
	return ret
end
local function tracebackex()
	local ret = "stack traceback:\n"
	local level = 3
	while true do
	   --get stack info
	   local info = debug.getinfo(level, "Slnu")
	   if not info then break end
	   if info.what == "C" then                -- C function
		ret = ret .. tostring(level-2) .. string.format("\tC function `%s`\n",info.name)
	   else           -- Lua function
		ret = ret .. tostring(level-2) .. string.format("\t%s:%d in function `%s`\n", info.short_src, info.currentline, info.name or "")
	   end
	   local szarg=info.nparams
	   --get local vars
	   local i = 1
	   while true do
		local name, value = debug.getlocal(level, i)
		if not name then break end
		if i<= szarg then 
			name='<'..name..'>'
			ret = ret .. "\t\t" .. name .. " =\t" .. tostringex(value, 3) .. "\n"
			i = i + 1
		else
			break
		end
	   end
	   level = level + 1
	end
	return ret
end

function EXCEPTION(e)
	return e.."\n"..tracebackex()
end

package.cpath=".\\plugins\\LiteLuaLoader\\lualib\\?.dll"
package.path=".\\plugins\\LiteLuaLoader\\lua\\?.lua;.\\plugins\\LiteLuaLoader\\lualib\\?.lua;.\\plugins\\LiteLuaLoader\\lua\\?\\init.lua"
