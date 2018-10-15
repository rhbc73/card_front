import React, { Component } from "react";
import "./App.css";
import axios from "axios";
import { Table, Input, Row, Button, Modal, Form, message } from "antd";
import "antd/dist/antd.css";

const {Search} = Input;
const FormItem = Form.Item;
const { confirm } = Modal;

class App extends Component {
  constructor(props) {
    super(props);
  }

  columns = [
    {
      dataIndex: "userid",
      title: "User ID"
    },
    {
      dataIndex: "cardnumber",
      title: "Card Number"
    },
    {
      dataIndex: "type",
      title: "Type"
    },
    {
      dataIndex: "subtype",
      title: "Subtype"
    },
    {
      dataIndex: "cardholder",
      title: "Card Holder"
    },
    {
      dataIndex: "nickname",
      title: "Nick Name"
    },
    {
      dataIndex: "action",
      title: "Edit",
      width: 200,
      render: (text, row) => {
        return (
          <div>
            <Button onClick={() => this.modal("edit", row)}>Edit</Button>
            <Button
              style={{ marginLeft: 10 }}
              type="danger"
              onClick={() => this.remove(row)}
            >
              Delete
            </Button>
          </div>
        );
      }
    }
  ];
  state = {
    dataSource: [],
    visible: false,
    modalType: "add",
    editRow: {}
  };

  userid = "000001";

  componentDidMount() {
    this.filltable();
  }

  filltable = () => {
    axios.get("http://card2app.fhufmxx54e.us-east-2.elasticbeanstalk.com/000001/cards/").then(data => {
      this.setState({
        dataSource: data.data
      });
    });
  };

  handleOk = () => {
    this.props.form.validateFieldsAndScroll((err, value) => {
      if (err) return;
      let data = {
        cardnumber: value.cardnumber,
        cardholder: value.cardholder,
        nickname: value.nickname
      };
      if (this.state.modalType === "add") {
        axios.post("http://card2app.fhufmxx54e.us-east-2.elasticbeanstalk.com/000001/cards/", data).then(msg => {
          this.filltable();
          this.setState({ visible: false });
        });
      } else {
        axios
          .put(
            "http://card2app.fhufmxx54e.us-east-2.elasticbeanstalk.com/000001/cards/" + this.state.editRow.cardnumber,
            data
          )
          .then(data => {
            this.filltable();
            this.setState({ visible: false });
          });
      }
    });
  };

  // edit
  modal = (type, row) => {
    this.setState(
      {
        visible: true,
        modalType: type
      },
      () => {
        this.props.form.resetFields();
        if (type === "add") return;
        this.props.form.setFieldsValue({
          cardnumber: row.cardnumber,
          cardholder: row.cardholder,
          nickname: row.nickname
        });
        console.log(row);
        this.setState({ editRow: row });
      }
    );
  };

  // remove
  remove = row => {
    let _this = this;
    confirm({
      title: "Delete this card?",
      okText: "Yes",
      cancelText: "No",
      onOk() {
        axios
          .delete("http://card2app.fhufmxx54e.us-east-2.elasticbeanstalk.com/000001/cards/" + row.cardnumber)
          .then(data => {
            _this.filltable();
          });
      }
    });
  };

  querycardtype = (value)=> {
    if (value === '') return;

    axios
    .get("http://card2app.fhufmxx54e.us-east-2.elasticbeanstalk.com/cardtype/" + value)
    .then(data => {
      const type = '[type] ' + data.data.type + ' [subtype] ' + data.data.subtype;
      message.success(type, 0.3)
    });

  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 6 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 }
      }
    };

    return (
      <div className="App">
        <Row>
        <Search 
          type="number"
          style={{width: 300, marginLeft: 20, marginTop: 10, float: "left"}} 
          placeholder="input credit card number"
          onSearch={value=>this.querycardtype(value)}/>
        </Row>

        <Row>
          <Button
            type="primary"
            style={{ marginLeft: 20, marginTop: 10, float: "left" }}
            onClick={() => this.modal("add")}
          >
            Add Card
          </Button>
        </Row>

        <Row style={{ paddingTop: 20 }}>
          <Table
            dataSource={this.state.dataSource}
            rowKey={row => row.cardnumber}
            bordered
            columns={this.columns}
            pagination={false}
          />
        </Row>

        <Modal
          title={this.state.modalType === "add" ? "Add Card" : "Edit Card"}
          onOk={this.handleOk}
          onCancel={() => this.setState({ visible: false })}
          visible={this.state.visible}
        >
          <Form>
          <FormItem label="UserID" {...formItemLayout}>
              {(<Input type="number" value={this.userid} disabled="true" />)}
            </FormItem>

            <FormItem label="Card Number" {...formItemLayout}>
              {getFieldDecorator("cardnumber", {
                rules: [
                  { required: true, message: "Please input card number!" },
                  { min: 6, message: "Card number length should >= 6" }
                ]
              })(<Input type="number" placeholder="cardnumber" />)}
            </FormItem>
            <FormItem label="Card Holder" {...formItemLayout}>
              {getFieldDecorator("cardholder", {
                rules: [{ required: false }]
              })(<Input placeholder="cardholder" />)}
            </FormItem>
            <FormItem label="NickName" {...formItemLayout}>
              {getFieldDecorator("nickname", {
                rules: [{ required: false }]
              })(<Input placeholder="nickname" />)}
            </FormItem>
          </Form>
        </Modal>
      </div>
    );
  }
}

export default Form.create()(App);
