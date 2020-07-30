
const maskzero = (mask,varString)=>{
    let length = String(varString).length
    let maskzero = parseInt(mask) - parseInt(length)
    let zero = ''
    for(let x = 0; x < maskzero;x++){
        zero = zero + '0'
    }

    let yearnow = new Date().getFullYear()
    
    return `${yearnow}${zero}${varString}`
    
}


const generate_token = (length)=>{
    var a = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890".split("");
    var b = [];  
    for (var i=0; i<length; i++) {
        // var j = (Math.ceil(Math.random() * (a.length-1)).toFixed(0));
        var j = (Math.random() * (a.length-1)).toFixed(0);
        b[i] = a[j];
    }
    return b.join("");
}

const formatHour = (hour)=>{
    if(hour == null) return "00:00"
    const hournew = new Date(hour)
   // const hourdata = new Date(hournew-(60*1000*480) )
    const hourdata = hournew
    const _hour = `0${hourdata.getHours()}`
    const _minute = `0${hourdata.getMinutes()}`
    return `${_hour.slice(-2)}:${_minute.slice(-2)}`
}

const format12Hour = (hour)=>{
    let formattedhour = formatHour(hour)
    let rawhour = formattedhour.split(":")
    let finalhour
    if(rawhour[0] == 12){
        return `${formattedhour} pm`
    }
    else if(rawhour[0] > 12){
            finalhour = rawhour[0] - 12
            return `${finalhour}:${rawhour[1]} pm`
    }else if(parseInt(rawhour[0])==0){
        finalhour = 12
        return `${finalhour}:${rawhour[1]} am`
    }else{
        return `${formattedhour} am`
    }

}


const formatraw12Hour = (formattedhour)=>{
    let rawhour = formattedhour.split(":")
    let finalhour
    if(rawhour[0] == 12){
        return `${formattedhour} pm`
    }
    else if(rawhour[0] > 12){
            finalhour = rawhour[0] - 12
            return `${finalhour}:${rawhour[1]} pm`
    }else if(parseInt(rawhour[0])==0){
        finalhour = 12
        return `${finalhour}:${rawhour[1]} am`
    }else{
        return `${formattedhour} am`
    }
}


const formatDate = (date)=>{
    let bdate = new Date(date)
    let year =  bdate.getFullYear()
    let month = `0${bdate.getMonth()+1}`
    let day = `0${bdate.getDate()}`
    return  `${year}-${month.slice(-2)}-${day.slice(-2)}`
}


module.exports = { maskzero, generate_token ,formatHour , format12Hour, formatraw12Hour , formatDate}
