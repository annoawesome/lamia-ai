
const authedRequest = new Request('/api/v1/isAuthed', {
    method: 'GET'
});

fetch(authedRequest)
    .then(res => {
        console.log(res);
        console.log('Success?');
    });