local requests=require("requests")
function get(reqid,url)
    local res=requests.get({url,timeout=2})
    SEND(reqid,res.text,res.status_code)
end
