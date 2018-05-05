import React, { Component } from 'react';
import './App.css';

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

    changeReadOnly(){
        //#TODO
        // this.setState({readOnly:false})
    }

    render(){
        return (
            <tr className = 'fixed-table-row'>
            <td><input type="checkbox"/></td>
                <td><input type='text' value={this.renderName()} readOnly={this.state.readOnly} onDoubleClick={this.changeReadOnly}/></td>
            <td>{this.renderSize()}</td>
            <td>{this.renderType()}</td>

            </tr>
        )
    }
}

export class File extends Element{
    constructor(props) {
        super()
        this.state = {
            name: props.content.name,
            size: props.content.size,
            type: 'File',
            readOnly: true
        }
    }
}

export class Directory extends Element {
    constructor(props){
        super()
        this.state = {
            name: props.content.name,
            size: props.content.size,
            type: 'Directory',
            readOnly: true
        }
    }
}

class Window extends Component {
    constructor(props){
        super(props)
        this.state = {
            isLoading: true,
            url: props.url
        };
    }

    parseContent(jsonResponse){
        return jsonResponse.content.map(
            (element)=>{
                if(element['directory']){
                    return <Directory content={element}/>
                }
                else{
                    return <File content={element}/>
                }
            })
    }


    componentDidMount(){
        return fetch(this.state.url)
            .then( (e) =>{
                return e.json()
            } )
            .then( (json) => {
                this.setState({
                    isLoading: false,
                    path: json.path,
                    content: this.parseContent(json)
                })
            }
            )
            .catch( (err) => {
                console.log(err)
            })
    }

    remove(){

    }

    render(){
        if(this.state.content){
            return(
                <div>
                    <div className = 'fixed-table-header'>{this.state.path}</div>
                    <div className = 'fixed-table-content'>{this.state.content}</div>
                    <button onClick={this.remove}>Remove</button>
                    <button onClick={this.remove}>Remove</button>
                    <button onClick={this.remove}>Remove</button>
                </div>
            )
        }
        return (
            <div className = 'content-loader'>
            </div>
        )
    }
}

class App extends Component {

    componentDidMount(){
        console.log('parent')
    }

    render() {
        return (
            <div className = 'windows'>
                <div className = 'window-left'><Window url="http://localhost:8080/view?path=/home/woolfy"/></div>
                <div className = 'window-right'><Window url="http://localhost:8080/view?path=/home/woolfy"/></div>
            </div>
        );
  }
}

export default App;
