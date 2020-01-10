import React, { useState, useEffect } from 'reactn';
import { ListGroup, Container, Row, Col, Form } from 'react-bootstrap';
import axios from 'axios';

import UserEdit from './UserEdit';
import UserDelete from './UserDelete';

const UserAdmin = (props) => {
  const [categories, setCategories] = useState([]);
  const [providers, setProviders] = useState([]);
  const [users, setUsers] = useState([]);
  const [filterText, setFilterText] = useState('');

  const getData = () => {
    axios
      .get('/api/categories/list')
      .then((res) => {
        setCategories(Object.values(res.data));
      })
      .catch((err) => {
        console.log(err);
      });
    axios
      .get('/api/providers/list')
      .then((res) => {
        setProviders(Object.values(res.data));
      })
      .catch((err) => {
        console.log(err);
      });
    axios
      .get('/api/users/list')
      .then((res) => {
        setUsers(Object.values(res.data));
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    getData();
  }, []);

  const handleFilterTextChange = (event) => {
    setFilterText(event.target.value);
  };

  const handleRefreshData = () => {
    getData();
  };

  const mapUsers = () => {
    return users.filter(user => {
      return (user.email && user.email.toLowerCase().includes(filterText.toLowerCase())) ||
        (user.first_name && user.first_name.toLowerCase().includes(filterText.toLowerCase())) ||
        (user.last_name && user.last_name.toLowerCase().includes(filterText.toLowerCase()))
    }).map((user) => {
      return (
        <ListGroup.Item key={user._id}>
          <Row>
            <Col md="auto">
              <UserEdit
                refreshDataCallback={handleRefreshData}
                categories={categories}
                providers={providers}
                users={users}
                buttonName='Edit'
                id={user._id}
              />{' '}
              <UserDelete
                categories={categories}
                providers={providers}
                users={users}
                refreshDataCallback={handleRefreshData}
                id={user._id}
              />
            </Col>
            <Col md="auto">
              <Row>
                <h6
                  style={{
                    color: 'black',
                    display: 'inline',
                    paddingLeft: '2em',
                  }}
                >
                  <strong>Email: </strong>{user.email}
                </h6></Row>
              <Row>
                <h6
                  style={{
                    color: 'black',
                    display: 'inline',
                    paddingLeft: '2em',
                  }}
                >
                  <strong>Name: </strong>{`${user.first_name} ${user.last_name}`}
                </h6>
              </Row>
            </Col>
          </Row>
        </ListGroup.Item>
      );
    });
  };

  // Center the two columns of top level categories and subcategories
  return (
    <Container>
      <Row style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Col>
          <Form style={{ width: '100%' }}>
            <UserEdit
              refreshDataCallback={handleRefreshData}
              categories={categories}
              providers={providers}
              users={users}
              buttonName='Add User'
              style={{ marginBottom: '1em' }}
            />
            <Form.Group controlId='formFilterText'>
              <Form.Label>
                <strong>Filter users</strong>
              </Form.Label>
              <Row>
                <Col>
                  <Form.Control
                    value={filterText}
                    onChange={handleFilterTextChange}
                    placeholder='Filter users'
                  />
                </Col>
                <Col sm='auto'>
                  <Row
                    style={{
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  ></Row>
                </Col>
              </Row>
            </Form.Group>
          </Form>
        </Col>
      </Row>
      <Row>
        <ListGroup
          style={{
            display: 'inline-block',
            margin: '0 auto',
            alignSelf: 'flex-start',
          }}
        >
          <strong>Users</strong>
          {mapUsers()}
        </ListGroup>
      </Row>
    </Container>
  );
};

export default UserAdmin;
