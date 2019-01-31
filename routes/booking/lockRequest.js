//query that creates a lock on a slot
module.exports = (req, res) => {
    req.myCookie.booking = req.body;
    let timeFrom = req.body.timeFrom;
    let timeTo = req.body.timeTo;
    let startTime = req.body.date +'T'+ timeFrom + ":00.0z";
    let endTime = req.body.date +'T'+ timeTo + ":00.0z";
    calendarFunctions.checkBusy(calendarId,lockCalendarId, jwtClient,startTime,endTime,req.body.facility,function(err,response){
        if(err){
            console.log(err.code);
            console.log('Check busy error: ' + err.message);
            res.status(400).send('Error: We couldn\'t make your booking'); // some sort of error occurs on google's side
        }
        else{
            if (response == 'busy'){
                console.log('busy');
                res.status(400).send('Error: The time slot you chose is already booked'); //if the slot is busy
            }
            else{ // if not busy, we lock the slot, the user still needs to pay though
                let eventId =  rfc4122.v1();
                eventId = eventId.replace(/-/g,"");
                console.log(eventId);
                let lockDate = new Date();
                let currentTime = lockDate.getTime();
                let lockObject = JSON.stringify({ // put json in the event description
                    'facility':req.body.facility,
                    'time':currentTime
                })
                calendarFunctions.addEvent(lockCalendarId, jwtClient,startTime,endTime,'lock',lockObject,eventId,function(err){
                    if(err){
                        console.log(err.code);
                        console.log(err.message);
                        res.status(400).send('Error: We couldn\'t make your booking'); // some sort of error occurs on google's side
                    }
                    else{
                        console.log('200');
                        req.myCookie.booking.eventId = eventId;
                        res.sendStatus(200); //success
                        setTimeout(function () {
                            calendarFunctions.deleteEvent(lockCalendarId, jwtClient, eventId);
                        }, 120000); //delete lock on timeout
                    }
                });
            }
        }
    });
}
