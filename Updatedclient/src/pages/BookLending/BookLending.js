import React, { useEffect, useContext, useState } from 'react';

import { makeStyles } from "@material-ui/core/styles";
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import SearchIcon from '@material-ui/icons/Search';
import RefreshIcon from '@material-ui/icons/Refresh';
import Snackbar from '@material-ui/core/Snackbar';
import Avatar from '@material-ui/core/Avatar';
import { Table, TableRow, TableCell, TableHead, TableBody, Typography } from '@material-ui/core';
import DateRange from "@material-ui/icons/DateRange";
import InputLabel from "@material-ui/core/InputLabel";
import Select from '@material-ui/core/Select';
import FormControl from '@material-ui/core/FormControl';
import MenuItem from '@material-ui/core/MenuItem';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import CloseIcon from '@material-ui/icons/Close';
import AddIcon from '@material-ui/icons/Add';
import DoneIcon from '@material-ui/icons/Done';
import DeleteIcon from '@material-ui/icons/Delete';
import GetAppIcon from '@material-ui/icons/GetApp';

/*
import StdCard from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
*/
import Axios from 'axios';
import CustomSnackbar from '../../components/CustomSnackbar/CustomSnackbar';
import config from '../../config/config';
import CardBody from '../../components/Card/CardBody';
import Card from '../../components/Card/Card';
import CardHeader from '../../components/Card/CardHeader';
import CardFooter from '../../components/Card/CardFooter';
import CardAvatar from '../../components/Card/CardAvatar';
import CustomInput from '../../components/CustomInput/CustomInput';
import Container from '@material-ui/core/Container';
import Button from '../../components/CustomButtons/Button';
import Badge from '../../components/Badge/Badge';

import { lendingContext } from '../../contexts/LendingContext';
import { bookContext } from '../../contexts/BookContext';
import { readerContext } from '../../contexts/ReaderContext';

import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import relativeTime from 'dayjs/plugin/relativeTime';
import { CSVLink } from "react-csv";

import bookIcon from "../../assets/img/flat-book-icon-27.jpg";
import avatar from "../../assets/img/tim_512x512.png";

const styles = theme => ({
    paper: {
        margin: 'auto',
        overflow: 'hidden',
      },
      searchBar: {
        borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
      },
      searchInput: {
        fontSize: theme.typography.fontSize,
      },
      block: {
        display: 'block',
      },
      contentWrapper: {
        margin: '40px 16px',
      },
      cardCategoryWhite: {
        color: "rgba(255,255,255,.62)",
        margin: "0",
        fontSize: "14px",
        marginTop: "0",
        marginBottom: "0"
      },
      cardTitleWhite: {
        color: "#FFFFFF",
        marginTop: "0px",
        minHeight: "auto",
        fontWeight: "300",
        fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
        marginBottom: "3px",
        textDecoration: "none"
      },
      mt10: {
        marginTop: theme.spacing(3)
      }, 
      appBar: {
        position: 'relative',
      },
      title: {
        marginLeft: theme.spacing(2),
        flex: 1,
      },
      bigger: {
        minWidth: 130
      },
      mnTitle: {
        fontSize: '1rem',
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        fontWeight: '500',
        lineHeight: '1.6',
        letterSpacing: '0.0075em'
      },
      bigAvatar: {
        width: 120,
        height: 120
      },
      mnSquare: {
        borderRadius: '8px'
      },
      mnNoBoxShadow: {
        boxShadow: 'none'
      },
      mnMt: {
        marginTop: theme.spacing(2)
      },
      pointer: {
        cursor: 'pointer'
      }
})

const useStyles = makeStyles(styles);

const BookLending = (props) => {
    const classes = useStyles();
    const { lending, dispatch } = useContext(lendingContext);
    const { book } = useContext(bookContext);
    const { reader } = useContext(readerContext);
    //search
    const [ filter, setFilter ] = useState('');
    const [ filteredData, setFilterData] = useState(lending.list);
    const handleSearchChange = (e) => {
      setFilter(e.target.value);
      setFilterData(lending.list.filter(item => {
        return Object.keys(item).some(key => {
            if(typeof(item[key]) === 'object'){
              return Object.keys(item[key][0]).some(kie => {
                if(typeof(item[key][0][kie]) === 'string')
                  return item[key][0][kie].toLowerCase().includes(filter.toLowerCase())
              })
            }
        });
      }))
    } 

    // dayjs
    dayjs.locale('vi');
    dayjs.extend(relativeTime);
    // modal
    const [ openModal, setOpenModal ] = useState(false);
    const handleCloseModal = () => { setOpenModal(false); }
    const handleOpenModal = () => { setOpenModal(true); }
    // snackbar
    const [openSnackbar, setOpenSnackbar ] = useState(false);
    const handleCloseSnackbar = () => setOpenSnackbar(false);
    const handleOpenSnackbar = () => setOpenSnackbar(true);
    
    const getLendingList = () => {
        Axios.get(config.base_url + '/lendings')
            .then((result) => {
                dispatch({ type: 'GET_LENDING_LIST', payload: result.data})
                setFilterData(result.data);
            })
    }

    const [ values, setValues ] = useState({
        readerID: '',
        bookID: '',
        dueDate: '',
        returnDate: '3',
        snackbar_variant: '',
        snackbar_message: '',
        current_lendingId: '',
        reader_avatar: '',
        book_image: ''
    })

    const handleChange = (e) => {
      e.persist();
      setValues(oldValues => ({
        ...oldValues,
        [e.target.name]: e.target.value
      }))
    
    }

    const setDefaultValues = () => {
      setValues(oldValues => ({
        ...oldValues,
        readerID: '',
        bookID: '',
        dueDate: '',
        returnDate: '',
        reader_avatar: '',
        book_image: ''
      }))
    }

    const handleAddPressed = () => {
      setDefaultValues();
      handleOpenModal();
    }

    const handleReturnBook = (lendingId, bookId) => {
      Axios.get(config.base_url + '/lendings/' + lendingId + '/' + bookId)
        .then((result) => {
          setValues(old => ({
            ...old,
            snackbar_message: 'Xác nhận trả sách thành công !',
            snackbar_variant: 'success'
          }))
          handleOpenSnackbar();
          handleCloseModal();
          getLendingList();
        })
        .catch((err) => {
          setValues(old => ({
            ...old,
            snackbar_message: 'Có lỗi xảy ra khi xác nhận trả sách !',
            snackbar_variant: 'error'
          }))
          handleOpenSnackbar();
        })
    }

    const handleDeletePressed = (lendingId) => {
      setValues(old => ({
        ...old,
        current_lendingId: lendingId
      }))
      handleOpenAlertDelete();
    }

    const handleDeleteLendingBook = () => {
      Axios.delete(config.base_url + '/lendings/' + values.current_lendingId)
        .then((result) => {
          setValues(old => ({
            ...old,
            snackbar_message: 'Đã xóa thông tin mượn trả sách!',
            snackbar_variant: 'success'
          }))
          handleOpenSnackbar();
          handleCloseModal();
          getLendingList();
        })
        .catch((err) => {
          setValues(old => ({
            ...old,
            snackbar_message: 'Có lỗi xảy ra khi xóa thông tin mượn trả sách !',
            snackbar_variant: 'error'
          }))
          handleOpenSnackbar();
        })
        handleCloseAlertDelete();
    }

    const handleAddLending = (e) => {
      e.preventDefault();
      
        if(values.readerID === '' || values.bookID === ''){
          setValues(old => ({
            ...old,
            snackbar_message: 'Vui lòng chọn đọc giả và sách !',
            snackbar_variant: 'error'
          }))
          handleOpenSnackbar();
        } else {
          var formData = new FormData();
          formData.append('userId', values.readerID);
          formData.append('book', values.bookID);
          formData.append('dueDate', dayjs(new Date()).add(values.returnDate, 'day'));

          Axios.post(config.base_url + '/lendings', formData, { header: { 'Content-Type': 'multipart/form-data'}})
              .then((result) => {
                if(result.data.error){
                  // have no permission
                  setValues(old => ({
                    ...old,
                    snackbar_message: 'Bạn không được phép dùng chức năng này. Vui lòng liên hệ người quản trị!',
                    snackbar_variant: 'error'
                  }))
                  handleOpenSnackbar();
                } else {
                  // success
                  setValues(old => ({
                    ...old,
                    snackbar_message: 'Đã lưu thông tin mượn trả sách thành công !',
                    snackbar_variant: 'success'
                  }))
                  handleOpenSnackbar();
                  handleCloseModal();
                  getLendingList();
                }
              })
              .catch((err) => { 
                  setValues(old => ({
                      ...old,
                      snackbar_message: 'Có lỗi xảy ra khi thêm thông tin mượn trả sách !',
                      snackbar_variant: 'error'
                    }))
                    handleOpenSnackbar();
              })
      }
    }

    const handleReload = () => {
      getLendingList();
    }

    // 
    const [ alertDelete, setAlertDelete ] = useState(false);
    const handleOpenAlertDelete = () => setAlertDelete(true);
    const handleCloseAlertDelete = () => setAlertDelete(false);

    // reader choosen
    const [ openReaderChoosen, setOpenReaderChoosen ] = useState(false);
    const handleCloseReaderChoosen = () => setOpenReaderChoosen(false);
    const handleOpenReaderChoosen = () => setOpenReaderChoosen(true);
    const handleReaderChoosen = (reader) => {
      setValues(oldValues => ({
        ...oldValues,
        readerID: reader._id,
        reader_avatar: reader.avatar
      }))
      handleCloseReaderChoosen();
    }
    // book choosen
    const [ openBookChoosen, setOpenBookChoosen ] = useState(false);
    const handleCloseBookChoosen = () => setOpenBookChoosen(false);
    const handleOpenBookChoosen = () => setOpenBookChoosen(true);
    const handleBookChoosen = (book) => {
      if(book.status !== 'Available'){
        setValues(old => ({
          ...old,
          snackbar_message: 'Quyển sách này hiện đang được đọc giả khác mượn. Thử chọn quyển khác!',
          snackbar_variant: 'error'
        }))
        handleOpenSnackbar();
      } else {
        setValues(oldValues => ({
          ...oldValues,
          bookID: book._id,
          book_image: book.image
        }))
        handleCloseBookChoosen();
      }
    }

    const headers = [
      { label: "Tên đọc giả", key: "reader[0].name"},
      { label: "Tên sách", key: "book[0].title"},
      { label: "Ngày mượn", key: "createdAt"},
      { label: "Ngày phải trả", key: "dueDate"}
    ]
    
    useEffect(() => {
        document.title = "Mượn sách"
        getLendingList();
    }, [])

    return (
    <Paper className={classes.paper}>
      <AppBar className={classes.searchBar} position="static" color="default" elevation={0}>
        <Toolbar>
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <SearchIcon className={classes.block} color="inherit" />
            </Grid>
            <Grid item xs>
              <TextField
                value={filter}
                onChange={e => handleSearchChange(e)}
                name="search"
                fullWidth
                placeholder="Tìm kiếm"
                InputProps={{
                  disableUnderline: true,
                  className: classes.searchInput,
                }}
              />
            </Grid>
            <Grid item>
            <Tooltip title="Thêm">
                <IconButton onClick={() => handleAddPressed()}>
                  <AddIcon/>
                </IconButton>
              </Tooltip>

              <CSVLink data={lending.list ? lending.list : ''} headers={headers} filename={"DSMuonSach.csv"}>
                <Tooltip title="Xuất tệp tin excel">
                  <IconButton>
                    <GetAppIcon/>
                  </IconButton>
                </Tooltip>
              </CSVLink>

              <Dialog
                open={openModal}
                onClose={handleCloseModal}
                scroll={'body'}
                fullWidth={true} 
                maxWidth='md'
              >
                <DialogContent>
                        <Card>
                          <CardHeader color="info">
                            <h4 className={classes.cardTitleWhite}>Thêm thông tin mượn sách</h4>
                            <p className={classes.cardCategoryWhite}>Vui long nhập tất cả thông tin</p>
                          </CardHeader>
                          <CardBody>
                            <Grid container spacing={3} className={classes.mt10}>

                              <Grid item xs={12} md={4}>
                                <Card profile>
                                  <CardAvatar profile>
                                    <a href="#pablo" onClick={e => e.preventDefault()}>
                                      <Avatar src={values.reader_avatar ? values.reader_avatar : avatar} className={classes.bigAvatar}/>
                                    </a>
                                  </CardAvatar>
                                  <CardBody profile>
                                    <CustomInput
                                      labelText="Mã đọc giả"
                                      id="readerID"
                                      inputProps={{
                                        name: "readerID",
                                        value: values.readerID,
                                        onChange: handleChange
                                      }}
                                      formControlProps={{
                                        fullWidth: true
                                      }}
                                    />
                                    <Button round onClick={handleOpenReaderChoosen}>
                                      Chọn đọc giả
                                    </Button>
                                  </CardBody>
                                </Card>
                              </Grid>
                              
                              <Grid item xs={12} md={4}>
                                <Card profile>
                                  <CardAvatar profile className={classes.mnSquare}>
                                    <a href="#pablo" onClick={e => e.preventDefault()}>
                                      <Avatar src={values.book_image ? values.book_image : bookIcon} className={classes.bigAvatar + ' ' + classes.mnSquare}/>
                                    </a>
                                  </CardAvatar>
                                  <CardBody profile>
                                    <CustomInput
                                      labelText="Mã sách"
                                      id="bookID"
                                      inputProps={{
                                        name: "bookID",
                                        value: values.bookID,
                                        onChange: handleChange
                                      }}
                                      formControlProps={{
                                        fullWidth: true
                                      }}
                                    />
                                    <Button round onClick={handleOpenBookChoosen}>
                                      Chọn sách
                                    </Button>
                                  </CardBody>
                                </Card>
                              </Grid>
                              
                              <Grid item xs={12} md={4}>
                                <Card profile>
                                  <CardAvatar profile className={classes.mnNoBoxShadow}>
                                    <a href="#pablo" onClick={e => e.preventDefault()}>
                                      <DateRange color="primary" className={classes.bigAvatar}/>
                                    </a>
                                  </CardAvatar>
                                  <CardBody profile>
                                    <FormControl className={classes.bigger}>
                                      <InputLabel htmlFor="returnDate">Số ngày mượn</InputLabel>
                                      <Select
                                        onChange={handleChange}
                                        value={values.returnDate}
                                        inputProps={{
                                          name: 'returnDate',
                                          id: 'returnDate',
                                        }}
                                      >
                                        <MenuItem value={'3'}>3 ngày</MenuItem>
                                        <MenuItem value={'7'}>1 tuần</MenuItem>
                                        <MenuItem value={'14'}>2 tuần</MenuItem>
                                        <MenuItem value={'21'}>3 tuần</MenuItem>
                                        <MenuItem value={'30'}>1 tháng</MenuItem>
                                      </Select>
                                    </FormControl>
                                  </CardBody>
                                </Card>
                              </Grid>
                            </Grid>
                          </CardBody>
                          <CardFooter>
                            <Button color="info" onClick={handleAddLending}>Hoàn tất</Button>
                            <Button color="danger" onClick={handleCloseModal}>Đóng</Button>
                          </CardFooter>
                        </Card>
                </DialogContent>
              </Dialog>
              <Tooltip title="Tải lại">
                <IconButton onClick={() => handleReload()}>
                  <RefreshIcon className={classes.block} color="inherit" />
                </IconButton>
              </Tooltip>
            </Grid>
          </Grid>
        </Toolbar>
      </AppBar>
      <div className={classes.contentWrapper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Đọc giả</TableCell>
              <TableCell>Sách</TableCell>
              <TableCell>Ngày mượn</TableCell>
              <TableCell>Hạn trả</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {
              !lending ? null : filteredData.map((l) => {
                
                return (
                <TableRow key={l._id}>
                  <TableCell>{l.reader[0].name}</TableCell>
                  <TableCell>{l.book[0].title}</TableCell>
                  <TableCell>{dayjs(l.createdAt).format('DD/MM/YYYY')}</TableCell>
                  <TableCell>{dayjs(l.dueDate).format('DD/MM/YYYY')}</TableCell>
                  <TableCell>{dayjs(l.dueDate).isBefore(dayjs(l.createdAt)) ? <Badge color="danger">Trễ hạn</Badge> : <Badge color="success">Đang mượn</Badge>}</TableCell>
                  <TableCell>
                    <Tooltip title="Xác nhận trả sách">
                      <IconButton onClick={() => handleReturnBook(l._id, l.book[0]._id)}>
                        <DoneIcon/>
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Xóa">
                      <IconButton onClick={() => handleDeletePressed(l._id)}>
                        <DeleteIcon/>
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              )}
              )
            }
          </TableBody>
        </Table>
      </div>
      {/* snackbar for success reader added */}
      <Snackbar
        anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
        }}
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        >
        <CustomSnackbar
            onClose={handleCloseSnackbar}
            variant={values.snackbar_variant}
            message={values.snackbar_message}
        />
      </Snackbar>
      {/* end --- */}

      
      <Dialog
        fullScreen
        open={openReaderChoosen}
        onClose={handleCloseReaderChoosen}
      >
        <AppBar className={classes.appBar}>
          <Toolbar>
            <IconButton edge="start" color="inherit" onClick={handleCloseReaderChoosen} aria-label="close">
              <CloseIcon />
            </IconButton>
            <Typography variant="h6" className={classes.title}>
              Chọn đọc giả
            </Typography>
          </Toolbar>
        </AppBar>
        <Paper className={classes.modal_paper}>
          <Container>
            <Grid container >
      { reader.isLoading === false ? null : reader.list.map((rd) => (
          <React.Fragment key={rd._id} >
              <Grid item xs={12} md={4}>
            <ListItem alignItems="flex-start">
              <ListItemAvatar onClick={() => handleReaderChoosen(rd) } className={classes.pointer}>
                <Avatar alt="avatar" src={rd.avatar ? rd.avatar : avatar} />
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Typography
                      component="span"
                      className={classes.inline + ' ' + classes.mnTitle}
                      color="textPrimary"
                    >
                      {rd.name}
                    </Typography>
                }
                secondary={
                  <React.Fragment>
                    <Typography
                      className={classes.inline}
                      component="span"
                      variant="body2"
                      color="textPrimary"
                    >
                      {rd.email}
                    </Typography>
                    <Typography
                      className={classes.block}
                      component="span"
                      variant="body2"
                      color="textPrimary"
                    >
                      Cập nhật:{' ' + dayjs(rd.updatedAt).fromNow()}
                    </Typography>
                  </React.Fragment>
                }
                />
              
            </ListItem>
            </Grid>
          </React.Fragment>
            ))
            }
            </Grid>
          </Container>
        </Paper>
      </Dialog>

      <Dialog
        fullScreen
        open={openBookChoosen}
        onClose={handleCloseBookChoosen}
      >
        <AppBar className={classes.appBar}>
          <Toolbar>
            <IconButton edge="start" color="inherit" onClick={handleCloseBookChoosen} aria-label="close">
              <CloseIcon />
            </IconButton>
            <Typography variant="h6" className={classes.title}>
              Chọn sách
            </Typography>
          </Toolbar>
        </AppBar>
        <Paper className={classes.modal_paper}>
          <Container>
            <Grid container spacing={3} className={classes.mnMt}>
          { book.isLoading === false ? null : book.list.map((b) => ( 
          <Grid item xs={12} md={4} key={b._id}>
          
          <Card profile>
              <CardAvatar profile onClick={() => handleBookChoosen(b)} className={classes.mnSquare}>
                <a href="#pablo" onClick={e => e.preventDefault()}>
                  <Avatar  src={b.image ? b.image : bookIcon} className={classes.bigAvatar + ' '+ classes.mnSquare } />
                </a>
              </CardAvatar>
              <CardBody profile>
                <Typography className={classes.mnTitle}>{b.title}</Typography>
                <Typography>{b.author}</Typography>
              </CardBody>
            </Card>

          </Grid>
          ))}
            </Grid>
          </Container>
        </Paper>
        </Dialog>

        <Dialog
        open={alertDelete}
        onClose={handleCloseAlertDelete}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Xác nhận!"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Bạn có chắc muốn xóa thông tin giao dịch này ?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAlertDelete} color="primary">
            Hủy
          </Button>
          <Button onClick={() => handleDeleteLendingBook()} color="danger">
            Đồng ý
          </Button>
        </DialogActions>
      </Dialog>

    </Paper>
    )
}

export default BookLending;