const BASE_URL = 'https://lighthouse-user-api.herokuapp.com'
const indexAPI = BASE_URL + '/api/v1/users'
const showAPI = indexAPI + '/' //+ id
const users = []
const submitForm = document.querySelector('#submit-form')
const userDataPanel = document.querySelector('#userDataPanel div')
const panel = document.querySelector('body')
const userPerPage = 12
const paginationElement = document.querySelector('#pagination')
let currentPage = 1
let totalPage = 0
let filteredUser = []




//send api request & initialize user list
axios.get(indexAPI).then(response => {
  users.push(...response.data.results)
  paginationCreate(users.length)
  renderUserListAtPage(currentPage, users)
}).catch(error => console.log(error))



//listen event on 'More' button, 'favorite' button
panel.addEventListener('click', event => {

  //click 'More' button to show detailed info
  if (event.target.matches('.btn-modal')) {
    modalPersonal(showAPI + event.target.dataset.id)
    //click 'favorite' button to add or remove favorite   
  } else if (event.target.matches('.btn-favorite')) {
    if (event.target.tagName === 'I') {
      switchAddAndFavorite(event.target, event.target.parentElement.parentElement.dataset.id)
    } else {
      switchAddAndFavorite(event.target, event.target.parentElement.dataset.id)
    }
  }
})



//listen event on pagination bar
paginationElement.addEventListener('click', event => {

  const data = filteredUser.length ? filteredUser : users

  //switch to page and show user list of that page
  if (event.target.matches('.pagination-page')) {
    currentPage = Number(event.target.innerText)
    renderUserListAtPage(currentPage, data)

    //click 'previous' button to switch page
  } else if (event.target.matches('.pagination-previous')) {
    currentPage -= 1

    //min page constrain
    if (currentPage < 1) {
      currentPage = 1
    }
    renderUserListAtPage(currentPage, data)

    //click 'next' button to switch page  
  } else if (event.target.matches('.pagination-next')) {
    currentPage += 1

    //max page constrain
    if (currentPage > totalPage) {
      currentPage = totalPage
    }
    renderUserListAtPage(currentPage, data)
  }
})



//search user name
submitForm.addEventListener('submit', event => {
  event.preventDefault()

  //search keywords
  let keywords = document.querySelector('#submit-input').value.trim().toLowerCase()

  if (keywords === '') {
    alert('Please type keywords into search bar')
  } else {
    filteredUser = users.filter(data => data.name.toLowerCase().includes(keywords) || data.surname.toLowerCase().includes(keywords))

    // renderList(filteredUser)
    paginationCreate(filteredUser.length)
    renderUserListAtPage(1, filteredUser)
  }
})



//activate render user list
function renderList(data) {
  let info = ''
  data.forEach(item => {
    info += `
      <div class="col-md-3 mt-4">
        <div class="card bg-light" style="width: 12rem;">
          <img class="avatar card-img-top" src="${item.avatar}" alt="avatar">
          <div class="name mt-2 d-flex justify-content-center">
            <h6>${item.name} ${item.surname}</h6>
          </div>
          <div class="m-auto d-flex" data-id="${item.id}">
            <button type="button" 
                    class="btn btn-outline-info btn-modal btn-sm m-1" 
                    data-toggle="modal" 
                    data-target="#Modal-detailInfo" 
                    data-id="${item.id}"
              >More
            </button>
            ${decidePlusOrHeartIcon(item.id)}
          </div>
        </div>
      </div>
    `
  })
  userDataPanel.innerHTML = info
}

//activate personal modal
function modalPersonal(id) {
  const modalAvatar = document.querySelector('.modal-avatar')
  const modalName = document.querySelector('#modal-name')
  const modalEmail = document.querySelector('#modal-email')
  const modalGender = document.querySelector('#modal-gender')
  const modalAge = document.querySelector('#modal-age')
  const modalRegion = document.querySelector('#modal-region')
  const modalBirth = document.querySelector('#modal-birth')
  axios.get(id).then(response => {
    modalAvatar.src = response.data.avatar
    modalName.innerHTML = `${response.data.name} ${response.data.surname}`
    modalEmail.innerHTML = `E-mail: ${response.data.email}`
    modalGender.innerHTML = `Gender: ${response.data.gender}`
    modalAge.innerHTML = `Age: ${response.data.age}`
    modalRegion.innerHTML = `Region: ${response.data.region}`
    modalBirth.innerHTML = `Birthday: ${response.data.birthday}`
  })
}



//create pagination
function paginationCreate(dataAmount) {

  //number of totoal pages
  totalPage = Math.ceil(dataAmount / userPerPage)

  let addPage = '<li class="page-item"><a class="page-link pagination-previous" href="#" aria-label="Previous"><span aria-hidden="true" class="pagination-previous">&laquo;</span></a></li>'

  for (let i = 1; i <= totalPage; i++) {
    addPage += `
    <li class="page-item"><a class="page-link pagination-page" href="#">${i}</a></li>
    `
  }

  addPage += '<li class="page-item"><a class="page-link pagination-next" href="#" aria-label="Next"><span aria-hidden="true" class="pagination-next">&raquo;</span></a></li>'
  paginationElement.innerHTML = addPage
}



//render user list at current page
function renderUserListAtPage(page, data) {
  let dataInPage = []
  let indexStart = (page - 1) * userPerPage
  let indexEnd = page * userPerPage
  dataInPage = data.slice(indexStart, indexEnd)
  renderList(dataInPage)
}



//switch between add icon and heart icon
function switchAddAndFavorite(target, id) {
  const heartButton = '<i class="fas fa-heart btn-favorite"></i>'
  const plusButton = '<i class="fas fa-plus btn-favorite"></i>'
  const Parent = target.parentElement
  const Child = target.firstElementChild
  if (target.matches('.fa-plus')) {
    Parent.classList.remove('btn', 'btn-outline-info')
    Parent.classList.add('btn', 'btn-outline-danger')
    Parent.innerHTML = heartButton
    addToFavorite(id)
  } else if (target.matches('.fa-heart')) {
    Parent.classList.remove('btn', 'btn-outline-danger')
    Parent.classList.add('btn', 'btn-outline-info')
    Parent.innerHTML = plusButton
    removeFavorite(id)
  } else if (Child.matches('.fa-plus')) {
    target.classList.remove('btn', 'btn-outline-info')
    target.classList.add('btn', 'btn-outline-danger')
    target.innerHTML = heartButton
    addToFavorite(id)
  } else if (Child.matches('.fa-heart')) {
    target.classList.remove('btn', 'btn-outline-danger')
    target.classList.add('btn', 'btn-outline-info')
    target.innerHTML = plusButton
    removeFavorite(id)
  }
}



//add favorite
function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteUser')) || []
  const User = users.find(user => Number(user.id) === Number(id))
  list.push(User)
  localStorage.setItem('favoriteUser', JSON.stringify(list))
}



//remove favorite
function removeFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteUser'))
  const removeItemIndex = list.findIndex(user => Number(user.id) === Number(id))
  list.splice(removeItemIndex, 1)
  localStorage.setItem('favoriteUser', JSON.stringify(list))
}


//favorite user remain heart icon
function decidePlusOrHeartIcon(id) {
  const list = JSON.parse(localStorage.getItem('favoriteUser'))
  if (list === null) {
    return `<button type="button" 
                    class="btn btn-outline-info btn-favorite btn-sm m-1"
                    >
              <i class="fas fa-plus btn-favorite"></i>
            </button>`
  } else if (list.some(user => Number(user.id) === Number(id))) {
    return `<button type="button" 
                    class="btn btn-outline-danger btn-favorite btn-sm m-1"
                    >
              <i class="fas fa-heart btn-favorite text-danger"></i>
            </button>`
  } else {
    return `<button type="button" 
                    class="btn btn-outline-info btn-favorite btn-sm m-1"
                    >
              <i class="fas fa-plus btn-favorite"></i>
            </button>`
  }
}