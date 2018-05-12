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

    changeChecked(e,state){
        if(this.state.checked){
            this.setState({checked:false})
        }
        else{
            this.setState({checked:true})
        }
        this.state.callbackFunction(this,state)
    }

    render(){
        return (
            <tr className = 'fixed-table-row'>
            <td><input type="checkbox" onChange={(a) => this.changeChecked(a,this.state)}/></td>
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

    isChecked(element,state){
        if(!element.state.checked){
            this.state.checked.push({
                element: element,
                state: state
            })
        }
        else{
            this.state.checked = this.state.checked.filter(
                (e)=> e.element !==element
            )
        }
    }

    getData(){
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

    componentDidMount(){
        return this.getData()
    }

    async fetchRequests(url){
        const response = await fetch(url)
        return response
    }

    remove(){
        this.state.checked.map(
            (e) => {
                console.log(this.fetchRequests(this.state.base_url+'remove?path='+this.state.path+'/'+e.state.name))
                return e
            }
        )

        this.setState({checked:[]})
        this.componentDidMount()
    }

    updateStateWithModalName(event,e){
        this.state.changedNames.map(
            (a) => {
                if(a.elementState.state.name === e.name){
                    a.currentName = event.target.value
                }
                return a
            }
        )
    }

    changeName(event,e,element){

        const newName = this.state.changedNames.find(
            (a) => {
                return e.state.name === a.elementState.state.name
            }
        )

        const result = this.fetchRequests(this.state.base_url+'rename?path='+this.state.path+'/'+e.state.name+'|'+this.state.path+'/'+newName.currentName)

        if(this.state.checked.length===1){
            this.setState({renderChecked:false})
        }

        this.setState({
            checked: this.state.checked.filter(
                (a) => e.state.name !== a.key
            ),
            changedNames: this.state.changedNames.filter(
                (a) => e.state.name !== a.elementState.name
            )
        })

        this.componentDidMount()
    }

    wrapElement(e){
        return <tr key={e.state.name}><input type='textarea' placeholder={e.state.name} onChange={(a) => this.updateStateWithModalName(a,e.state)}/>
            <button onClick={(a) => this.changeName(a,e,this)}>Accept</button></tr>
    }

    rename(){
        //#TODO a modal with new name

        this.setState({
                renderChecked: true,
                changedNames: this.state.checked.map(
                    (e) => {
                        return {
                            currentName: e.name,
                            elementState: e
                        }
                    }
                ),
                checked: this.state.checked.map(
                    (e) => this.wrapElement(e)
                )
        })
    }

    render(){
        if(this.state.renderChecked){
            return(<div className='modal-mail'>
                {this.state.checked}
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
