/**
 * @class Model
 *
 * Manages the data of the application.
 */

class Model {
  
  //updated constructor from this.todos = array of object dummy data
  constructor() {
      this.todos = JSON.parse(localStorage.getItem('todos')) 
  }
  
  addToDo(todoText){
    const todo = {
        id: this.todos.length > 0 ? this.todos[this.todos.length - 1].id + 1 : 1,
        text: todoText,
        complete: false
    }
    this.todos.push(todo)
  }
  
  
  
  editTodo(id, updatedText) {
      this.todos = this.todos.map(todo =>
        todo.id === id ? {id: todo.id, text: updatedText, complete: todo.complete } : todo
      )
  }
  //localstorage change - 
  deleteTodo(id) {
      this.todos = this.todos.filter(todo => todo.id !== id)
      
      this.onTodoListChanged(this.todos)
  }
  
  completeTodo(id) {
      this.todos = this.todos.map(todo =>
        todo.id === id ? {id: todo.id, text: todo.text, complete: !todo.complete} : todo
      )
  }
  
  //bind event handlers
  bindTodoListChanges(callback){
      this.onTodoListChanged= callback
  }
  
  //add private method to update localstorage value
  privateCommit(todos){
      this.onTodoListChanged(todos)
      localStorage.setItem('todos', JSON.stringify(todos))
  }
}

class View {
  constructor() {
      //root element
      this.app = this.getElement('#root')
      
      //title of the app
      this.title = this.createElement('h1')
      this.title.textContent = 'Todos'
      
      //the form
      this.form = this.createElement('form')
      
      this.input = this.createElement('input')
      this.input.type = 'text'
      this.input.placeholder = 'Add todo'
      this.input.name ='todo'
      
      this.submitButton = this.createElement('button')
      this.submitButton.textContent = 'Submit'
      
      //visual of todo list
      this.todoList =this.createElement('ul', 'todo-list')
      
      //add input and submit
      this.form.append(this.input, this.submitButton)
      
      //add title, form, and todo list to app
      this.app.append(this.title, this.form, this.todoList)
      
      //add local storage
      this._temporaryTodoText
      this._initLocalListeners()
  }
  
  
  //update temporary state
  _initLocalListeners() {
      this.todoList.addEventListener('input', event => {
          if(event.target.className === 'editable'){
              this._temporaryTodoText = event.target.innerText
          }
      })
  }
  
  
  
  createElement(tag, className){
      const element = document.createElement(tag)
      if(className) element.classList.add(className)
      
      return element
  }
  
  getElement(selector){
      const element = document.querySelector(selector)
      
      return element
  }
  
  get privateText(){
      return this.input.value
  }
  
  privateResetInput(){
      this.input.value = ''
  }
  
  displayTodo(todos){
      //delete all nodes
      while (this.todoList.firstChild){
          this.todoList.removeChild(this.todoList.firstChild)
      }
      //show default mssg
      if(todos.length === 0){
          const p = this.createElement('p')
          p.textContent = "Nothing to do! Add a task?"
          this.todoList.append(p)
      } else {
          //create todo item
          todos.forEach(todo => {
              const li = this.createElement('li')
              li.id = todo.id
              
              //Each todo checkbox
              const checkbox = this.createElement('input')
              checkbox.type = "checkbox"
              checkbox.check = todo.complete
              
              //todo item in span tag thats editable
              const span = this.createElement('span')
              span.contentEditable = true
              span.classList.add('editable')
              
              //if todo is complete it has a strikethrough
              if(todo.complete){
                  const strike = this.createElement('s')
                  strike.textContent = todo.text
                  span.append(strike)
              } else {
                  span.textContent = todo.text
              }
              
              //todos have a delete button
              const deleteButton = this.createElement('button', 'delete')
              deleteButton.textContent = "Delete"
              li.append(checkbox, span, deleteButton)
              
              //append nodes to todo list
              this.todoList.append(li)
          })
      }
  }
  
  //event handlers
  bindAddTodo(handler){
      this.form.addEventListener('submit', event => {
          event.preventDefault()
          
          if(this.privateText) {
              handler(this.privateText)
              this.privateResetInput
          }
      })
  }
  
  bindEditTodo(handler){
      this.todoList.addEventListener('focusout', event =>{
          if (this._temporaryTodoText){
              const id = parseInt(event.target.parentElement.id)
              
              handler(id, this._temporaryTodoText)
              this._temporaryTodoText = ''
          }
      })
  }
  
  bindDeleteTodo(handler){
      this.todoList.addEventListener('click', event => {
          if(event.target.className === 'delete') {
              const id = parseInt(event.target.parentElement.id)
              
              handler(id)
          }
      })
  }
  
  bindToggleTodo(handler){
      this.todoList.addEventListener('change', event => {
          if(event.target.type === 'checkbox'){
              const id = parseInt(event.target.parentElement.id)
          
              handler(id)
          }
      })
  }
  
  
}

class Controller {
  constructor(model, view) {
    this.model = model
    this.view = view
    
    //display initial todos
    this.onTodoListChanged(this.model.todos)
  }
  
  onTodoListChanged = todos => {
      this.view.displayTodo(todos)
  }
  
  handleAddTodo = todoText => {
      this.model.addTodo(todoText)
  }
  
  handleEditTodo = id => {
      this.model.deleteTodo(id)
  }
  
  handeDeleteTodo = id => {
      this.model.deleteTodo(id)
  }
  
  handleCompleteTodo = id => {
      this.model.completeTodo(id)
  }
  
  //bind event handlers
  this.view.bindAddTodo(this.handleAddTodo)
  this.view.bindEditTodo(this.handleEditTodo)
  this.view.bindDeleteTodo(this.handeDeleteTodo)
  this.view.bindToggleTodo(this.handleCompleteTodo)
  this.model.bindTodoListChanges(this.onTodoListChanged)
  
}

const app = new Controller(new Model(), new View())




