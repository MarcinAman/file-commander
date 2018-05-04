import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';


/*because i would like to have a common render method to allow easy modifications */

class Element extends Component {
    render(){
        return `<tr class = 'fixed-table-row'>
            <td><input type="checkbox"></td>
            <td>${this.renderPrivileges()}</td>
            <td>${this.renderName}</td>
        </tr>`
    }
}

class File extends Element{
    constructor(jsonElement){
        super()

        this.state = {
            name: jsonElement.name,
            privileges: jsonElement.privileges
        }
    }

    setState = (jsonElement) => {
        this.state.name = jsonElement.name
        this.state.privileges = jsonElement.privileges
    }

    renderPrivileges = () => {
        return this.state.privileges.toString()
    }

    renderName = () => {
        return this.state.name.toString()
    }
}

class Directory extends Element {
    constructor(jsonElement){
        super()
        this.state = {
            name: jsonElement.name,
            privileges: jsonElement.privileges
        }
    }

    renderPrivileges = () => {
        return this.state.privileges.toString()
    }

    renderName = () => {
        return this.state.name.toString()
    }
}

class Window extends Component {
    constructor(type){
        super()
        this.currentURL = ''
        this.type = type
    }

    parseContent(jsonResponse){
        return jsonResponse.reduce(
            (prev,element)=>{
                if(element.type==='directory'){
                    return prev.push(Directory(element))
                }
                else{
                    return prev.push(File(element))
                }
            }
        ,[])
    }

    async getJsonFromAPI(apiURL){
        return fetch(apiURL)
            .then( (result) => {
                return result.json()
            })
            .catch((e) => {
                console.log(e)
            })
    }

    setState = () => {
        this.getJsonFromAPI(this.currentURL).then(
            (json) => {
                this.content = {
                    path: json['path'],
                    content: this.parseContent(json)
                }
            }
        )
    }

    render() {
        return ''
    }
}

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
      </div>
    );
  }
}

export default App;

/*
JSON format:
{
    path: <path>,
    content: [
                {type: directory, name: SomeFolder,privileges: SomePrivileges},
                {type:file, name: SomeFile, privileges:SomePrivileges} Mby size as an extra information?
              ]
}

 */