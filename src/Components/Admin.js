import React from 'react'
import axios from 'axios'
import {Redirect} from 'react-router-dom'
import withStyles from '@material-ui/core/styles/withStyles';
import { CssBaseline, Paper, Avatar, FormControl, InputLabel, Input, Button } from '@material-ui/core';
import logo from '../img/acn_icon.png';
import {withRouter} from 'react-router-dom'
import compose from 'recompose/compose';
import Cookies from 'universal-cookie';
import { ToastsStore } from 'react-toasts';
import bg from '../img/accenture_big.png';


const styles = theme => ({
  main: {
    width: 'auto',
    display: 'block', // Fix IE 11 issue.
    marginLeft: theme.spacing.unit * 3,
    marginRight: theme.spacing.unit * 3,
    [theme.breakpoints.up(400 + theme.spacing.unit * 3 * 2)]: {
      width: 400,
      marginLeft: 'auto',
      marginRight: 'auto',
    },
  },
  paper: {
    marginTop: theme.spacing.unit * 8,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: `${theme.spacing.unit * 2}px ${theme.spacing.unit * 3}px ${theme.spacing.unit * 3}px`,
  },
  avatar: {
    margin: theme.spacing.unit,
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing.unit,
  },
  submit: {
    marginTop: theme.spacing.unit * 3,
    backgroundColor: '#F9C03E',
    fontWeight: 'bold',
    color: 'black',
    '&:hover': {
      backgroundColor: '#EBA810',
    }
  },
});

class Admin extends React.Component{

  state = {
    redirect: false
  }


    getAdmin = async(e) => {
        e.preventDefault();
        const username = e.target.elements.username.value;
        const password = e.target.elements.password.value;
        if(username && password){
          axios.post('https://user-service.ticket.lepak.sg/user/login', {
            username: username,
            password: password,
    })
    .then((res => {
      const LoggedSessionToken = res.data.session_token;
        const cookies = new Cookies();
        cookies.set('AdminSessionToken', LoggedSessionToken, {path: '/'});
    this.setState({
      redirect: true,
    })
    console.log('success');
  }))
  .catch(error => {
    ToastsStore.error('Login failed. Please check your username and password.')
    console.log('failed')
  })  
}}
      
    render(){
      const { classes } = this.props;

      if(this.state.redirect){
        this.props.history.push('/tickets');
      }
        return(
          <div>
          <main className={classes.main}>
           <CssBaseline />
           <Paper className={classes.paper}>
             <Avatar className={classes.avatar}>
               {/* <LockOutlinedIcon /> */}
               <img src={logo} alt="acn_logo" width='40' height='40'/>
             </Avatar>
             <form className={classes.form}  onSubmit={this.getAdmin} >
               <FormControl margin="normal" required fullWidth>
               <InputLabel htmlFor="username">Username</InputLabel>
               <Input id="username" name="username" autoComplete="username" autoFocus onChange={this.handleInputChange} />
               </FormControl>
               <FormControl margin="normal" required fullWidth>
               <InputLabel>Password</InputLabel>
                 <Input name="password" type="password" id="password" autoComplete="current-password" onChange={this.handleInputChange}/>
                 </FormControl>
               <Button
                 type="submit"
                 fullWidth
                 variant="contained"
                 className={classes.submit}
               >
                 Sign in
               </Button>
             </form> 
           </Paper>
         </main>
         <img src={bg} width="400" height="240" className="testing123"/>
           </div>
        )
    }
}

export default compose(withRouter, withStyles(styles))(Admin);
