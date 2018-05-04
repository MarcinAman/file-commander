import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

/*https://stackoverflow.com/questions/43262121/trying-to-use-fetch-and-pass-in-mode-no-cors*/

/*because i would like to have a common render method to allow easy modifications */

export class Element extends Component {
    renderType = () => {
        return this.state.type.toString()
    }

    renderSize = () => {
        return this.state.size.toString()
    }

    renderName = () => {
        return this.state.name.toString()
    }

    setState = (jsonElement) => {
        this.state.name = jsonElement.name
        this.state.size = jsonElement.size
    }

    render(){
        return `<tr class = 'fixed-table-row'>
            <td><input type="checkbox"></td>
            <td>${this.renderType()}</td>
            <td>${this.renderName()}</td>
            <td>${this.renderSize()}</td>
        </tr>`
    }
}

export class File extends Element{
    constructor(jsonElement) {
        super()
        this.state = {
            name: jsonElement.name,
            size: jsonElement.size,
            type: 'File'
        }
    }
}

export class Directory extends Element {
    constructor(jsonElement){
        super()
        this.state = {
            name: jsonElement.name,
            size: jsonElement.size,
            type: 'Directory'
        }
    }
}

export class Window extends Component {
    constructor(type,baseURL){
        super()
        this.currentURL = baseURL
        this.type = type
        this.content = {
            path: '',
            content: []
        }

    }

    parseContent(jsonResponse){
        return jsonResponse.reduce(
            (prev,element)=>{
                if(element['directory']){
                    return prev.push(new Directory(element))
                }
                else{
                    return prev.push(new File(element))
                }
            }
        ,[])
    }

    async getJsonFromAPI(apiURL){
        return fetch(apiURL)
            .then( (result) => {
                return result
            })
            .catch((e) => {
                console.log(e)
            })
    }

    randomTest = () => { //'https://cors-anywhere.herokuapp.com/'+
        fetch('localhost:8080/view?path=/')
            .then( (result)=>{
                console.log(result)
            })
            .catch( (e) =>{
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
        this.randomTest()
        setTimeout(2000)
        return ''
        return this.getJsonFromAPI('localhost:8080/view?path=/')
            .then(
                (json) => {
                    return {
                        path: json['path'],
                        content: this.parseContent(json)
                    }
                }
            )
            .then( (e)=>{
                e['content'].reduce( (acc,element) => {
                        return `${acc}+${element.render()}`
                    },''
                )
            })
    }
}

class App extends Component {
    init = () => {
        this.state = {
            leftWindow: new Window('left','localhost:8080/view?path=/')
        }
    }

  render() {
        this.init()
        return (
            this.state.leftWindow.render()
        );
  }
}

export default App;