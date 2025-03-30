
const authedRequest = new Request('/isAuthed', {
    method: 'GET'
});

fetch(authedRequest)
    .then(res => {
        console.log(res);
        console.log('Success?');
    });