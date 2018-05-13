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
        if(this.state.type === 'Directory'){
            return(<div onClick={(e) => this.state.changePath(e,this.state.name)}>{this.state.name.toString()}</div>)
        }
        return(<div>{this.state.name.toString()}</div>)
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
            callbackFunction: props.isChecked
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
            callbackFunction: props.isChecked,
            changePath: props.changePath
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
            path: props.path,
            returnChecked: props.checked,
            changeCurrentPath: props.changePath
        };
        this.remove = this.remove.bind(this)
        this.rename = this.rename.bind(this)
        this.isChecked = this.isChecked.bind(this)
        this.changeName = this.changeName.bind(this)
        this.updateStateWithModalName = this.updateStateWithModalName.bind(this)
        this.changePath = this.changePath.bind(this)
    }

    changePath(event,e){
        if(e === '..'){
            const index = this.state.path.lastIndexOf('/')
            this.setState(
                (prev) => ({
                    content: false,
                    path: prev.path.substring(0,index)
                }),
                () => {
                    // console.log(this.state.base_url+'view?path='+this.state.path)
                    this.state.changeCurrentPath(this.state.path)
                    this.componentDidMount()
                }
            )
        }
        else{
            this.setState(
                (prev) => ({
                    content: false,
                    path: prev.path+"/"+e
                }),
                () => {
                    // console.log(this.state.base_url+'view?path='+this.state.path)
                    this.state.changeCurrentPath(this.state.path)
                    this.componentDidMount()
                }
            )
        }
    }


    parseContent(jsonResponse){
        return jsonResponse.content.map(
            (element)=>{
                if(element['directory']){
                    return <Directory content={element} isChecked={this.isChecked} changePath={this.changePath}/>
                }
                else{
                    return <File content={element} isChecked={this.isChecked}/>
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

        this.state.returnChecked(this.state.checked);
    }

    getData(){
        return fetch(this.state.base_url+'view?path='+this.state.path)
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
        //#TODO rendering error
        this.setState((prev) =>{
            prev.checked.forEach(
                (e) =>{
                    return this.fetchRequests(this.state.base_url+'remove?path='+this.state.path+'/'+e.state.name)
                        .then(
                            this.componentDidMount()
                        )
                }
            )

            return {
                checked: []
            }
        }
        )
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
                    <div onClick={(e) => this.changePath(e,'..')}>..</div>
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
    constructor(){
        super()

        this.state = {
            base_url:'http://localhost:8080/',
            leftPath: "/home/woolfy",
            rightPath: "/home/woolfy"
        }

        this.copy = this.copy.bind(this)
        this.addChecked = this.addChecked.bind(this)
        this.changeCurrentPath = this.changeCurrentPath.bind(this)
    }

    changeCurrentPath(site,e){
        if(site==='left'){
            this.setState({leftPath:e})
        }
        else{
            this.setState({rightPath:e})
        }
    }

    async fetchRequests(url){
        console.log(url)
        return await fetch(url)
    }

    addChecked(site,e){
        if(site==='left'){
            this.setState({checkedLeft:e})
        }
        else{
            this.setState({checkedRight:e})
        }
    }

    componentDidMount(){
        console.log('parent')
    }

    copy(event){
        //#TODO doesnt copy from right to left + update
        let iterable = []
        let from = ''
        let to = ''

        if(this.state.checkedLeft!==undefined){
            iterable = this.state.checkedLeft
            from = this.state.leftPath
            to =this.state.rightPath
        }
        else{
            to = this.state.leftPath
            from = this.state.rightPath
            iterable = this.state.checkedRight
        }

        iterable.forEach(
            (e) => {
                this.fetchRequests(this.state.base_url+"copy?path="+from+"/"+e.state.name+"|"+to+"/"+e.state.name)
            }) //magnificent error handling
    }

    render() {
        return (
            <div className = 'windows'>
                <div className = 'window-left'><Window url={this.state.base_url + "view?path="+this.state.leftPath}
                                                       base_url={this.state.base_url}
                                                       path={this.state.leftPath}
                                                        checked={(e) => this.addChecked('left',e)}
                                                        changePath={(a)=>this.changeCurrentPath('left',a)}/></div>
                <div className = 'window-right'><Window url={this.state.base_url + "view?path="+this.state.rightPath}
                                                        base_url={this.state.base_url}
                                                        path={this.state.leftPath}
                                                        checked={(e)=>this.addChecked('right',e)}
                                                        changePath={(a)=>this.changeCurrentPath('left',a)}/></div>
                <button onClick={this.copy}>Copy</button>
            </div>
        );
  }
}

export default App;
