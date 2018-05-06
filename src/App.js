import React, { Component } from 'react';
import './App.css';

export class Element extends Component {
    constructor(){
        super()
        this.changeChecked = this.changeChecked.bind(this)
    }
    renderType = () => {
        return this.state.type.toString()
    }

    renderSize = () => {
        return this.state.size.toString()
    }

    renderName = () => {
        return this.state.name.toString()
    }

    changeChecked(e){
        if(this.state.checked){
            this.setState({checked:false})
        }
        else{
            this.setState({checked:true})
        }
        this.state.callbackFunction(this)
    }

    render(){
        return (
            <tr className = 'fixed-table-row'>
            <td><input type="checkbox" onChange={this.changeChecked}/></td>
                <td>{this.renderName()}</td>
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
            checked: false,
            callbackFunction: props.callback
        }

        this.changeChecked = this.changeChecked.bind(this)
    }
}

export class Directory extends Element {
    constructor(props){
        super()
        this.state = {
            name: props.content.name,
            size: props.content.size,
            type: 'Directory',
            checked: false,
            callbackFunction: props.callback
        }
    }
}

class Window extends Component {
    constructor(props){
        super(props)
        this.state = {
            isLoading: true,
            url: props.url,
            base_url: props.base_url,
            checked: [],
            path: props.path
        };
        this.remove = this.remove.bind(this)
        this.rename = this.rename.bind(this)
        this.isChecked = this.isChecked.bind(this)
        this.changeName = this.changeName.bind(this)
        this.updateStateWithModalName = this.updateStateWithModalName.bind(this)
    }

    parseContent(jsonResponse){
        return jsonResponse.content.map(
            (element)=>{
                if(element['directory']){
                    return <Directory content={element} callback={this.isChecked}/>
                }
                else{
                    return <File content={element} callback={this.isChecked}/>
                }
            })
    }

    isChecked(element){
        if(!element.state.checked){
            this.state.checked.push(element)
        }
        else{
            this.state.checked = this.state.checked.filter((e)=>
                e!==element
            )
        }
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

    async fetchRequests(url){
        const response = await fetch(url)
        return true
    }

    componentDidUpdate(){
        return this.componentDidMount()
    }

    remove(){
        this.state.checked.map(
            (e) => {
                return this.fetchRequests(this.state.base_url+'remove?path='+this.state.path+'/'+e.state.name)
            }
        )

        this.setState(this.state)
    }

    updateStateWithModalName(event,e){
        this.state.modals.map(
            (ele) => {
                if(e.name === ele.name){
                    ele.state.name = event.target.value //?????
                }
                return ele
            }
        )
    }

    changeName(event,e){

        this.state.modals.filter(
            (a) => a!==e
        )

        const result = this.fetchRequests(this.state.base_url+'rename?path='+this.state.path+'/'+e.state.name+'|'+this.state.path+'/'+event.target.value)

        this.setState(this.state)
    }

    rename(){
        //#TODO a modal with new name

        this.setState({
                renderModal: true,
                modals: this.state.checked.map(
                    (e) => <tr><input type='textarea' placeholder={e.state.name} onChange={(a) => this.updateStateWithModalName(a,e)}/>
                        <button onClick={(a) => this.changeName(a,e)}>Accept</button></tr>
            )
        })
    }

    render(){
        if(this.state.renderModal){
            return(<div className='modal-mail'>
                {this.state.modals}
            </div>)
        }
        if(this.state.content){
            return(
                <div>
                    <div className = 'fixed-table-header'>{this.state.path}</div>
                    <div className = 'fixed-table-content'>{this.state.content}</div>
                    <button onClick={this.remove}>Remove</button>
                    <button onClick={this.rename}>Rename</button>
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
                <div className = 'window-left'><Window url="http://localhost:8080/view?path=/home/woolfy"
                                                       base_url="http://localhost:8080/"
                                                       path="/home/woolfy"/></div>
                <div className = 'window-right'><Window url="http://localhost:8080/view?path=/home/woolfy"
                                                        base_url="http://localhost:8080/"
                                                        path="/home/woolfy"/></div>
            </div>
        );
  }
}

export default App;
