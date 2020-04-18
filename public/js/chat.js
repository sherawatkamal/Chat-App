const socket = io()
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $locationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

const { username , room } = Qs.parse(location.search,{ignoreQueryPrefix: true})

const autoScrool = () => {
    //New message element
    const $newMessage = $messages.lastElementChild

    //Height of new message
    const newMessageStyles = getComputedStyle($newMessage)
    const $newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + $newMessageMargin

    // Visible height
    const visibleHeight = $messages.offsetHeight

    //Height of messages container
    const containerHeight = $messages.scrollHeight

    //How far have I scrool
    const scroolOffSet = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scroolOffSet) {
        $messages.scrollTop = $messages.scrollHeight
    }

    console.log($newMessageMargin)
}

socket.on('message', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate, {
       username:message.username,
       message: message.text,
       createdAt:moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoScrool()
})

socket.on('locationMessage', (location) => {
    console.log(location)
    const html = Mustache.render(locationTemplate, {
        username:location.username,
        location:location.locationURL,
        createdAt:moment(location.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoScrool()
})

socket.on('roomData' ,({ room, users }) => {
    const html = Mustache.render(sidebarTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

$messageForm.addEventListener('submit', (e) => {

    e.preventDefault()
    $messageFormButton.disabled = true

    const message = e.target.elements.message.value

    socket.emit('sendMessage', message, (error) => {

        $messageFormButton.disabled = false
        $messageFormInput.value = ''
        $messageFormInput.focus()


        if (error) {
            return console.log(error)
        }
        console.log('Message delivered')
    })
})

$locationButton.addEventListener('click', (e) => {
    if (!navigator.geolocation) {

        return alert('Geolocation is not supporte in your browser.')
    }

    $locationButton.disabled = true

    navigator.geolocation.getCurrentPosition((position) => {

        socket.emit('sendLocation', {

            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {

            $locationButton.disabled = false
            console.log('Location delivered!')
        })

    })
})

socket.emit('join', { username , room },(error) =>{
    if(error) {
        alert(error)
        location.href('/')
    }
} ) 