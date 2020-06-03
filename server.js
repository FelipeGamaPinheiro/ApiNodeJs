require("dotenv-safe").config();
const jwt = require('jsonwebtoken');
const express = require('express');
const app = express();
const data = require('./data/pessoa.json');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

app.use(express.json());

const swaggerOptions = {
    swaggerDefinition: {
        info: {
            title: 'API em Node Js',
            version: '1.0.0',
            description: 'Teste da API com documentação Swagger'
        },
        servers: ["http://localhost:3000"]
    },
    apis: ['server.js']
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

/**
 * @swagger
 * /pessoa:
 *  get:
 *    description: Use para obter a lista completa de pessoas.
 *    responses:
 *      '200':
 *        description: Uma resposta de sucesso.
 */
app.get('/pessoa', verifyJWT, function(req, res){
    res.status(200).json(data);
});

/**
 * @swagger
 * /pessoa/{id}:
 *  get:
 *    description: Use para obter apenas uma pessoa.
 *    responses:
 *      '200':
 *        description: Uma resposta de sucesso.
 *    parameters:
 *     - name: id
 *       in: path
 *       required: true
 *       schema:
 *         type: string
 *         format: string
 */
app.get('/pessoa/:id', verifyJWT, function(req, res){
    const {id} = req.params;
    const pessoa = data.find(pes => pes.id == id);
    if(pessoa == null){
        res.status(404);
    }

    res.status(200).json(pessoa);
});

/**
 * @swagger
 * /pessoa:
 *  post:
 *    description: Use para adicionar uma pessoa à lista.
 *    responses:
 *      '200':
 *        description: Uma resposta de sucesso.
 *    parameters:
 *    - in: 'body'
 *      name: 'body'
 *      required: true
 */
app.post('/pessoa', verifyJWT, function(req, res){
    data.push({
        id: req.body.id,
        nome: req.body.nome,
        cidade: req.body.cidade
    });

    res.status(201).json(data);
});

/**
 * @swagger
 * /pessoa/{id}:
 *  put:
 *    description: Use para atualizar uma pessoa da lista.
 *    responses:
 *      '200':
 *        description: Uma resposta de sucesso.
 *    parameters:
 *     - name: id
 *       in: path
 *       required: true
 *       schema:
 *         type: string
 *         format: string
 */
app.put('/pessoa/:id', verifyJWT, function(req, res){
    const {id} = req.params;
    const pessoa = data.find(pes => pes.id == id);
    const {nome, cidade} = req.body;
    if(pessoa == null){
        res.status(400);
    }

    pessoa.nome = nome;
    pessoa.cidade = cidade;

    res.status(200).json(pessoa);
});


/**
 * @swagger
 * /pessoa/{id}:
 *  delete:
 *    description: Use para deletar uma pessoa da lista.
 *    responses:
 *      '200':
 *        description: Uma resposta de sucesso.
 *    parameters:
 *     - name: id
 *       in: path
 *       required: true
 *       schema:
 *         type: string
 *         format: string
 */
app.delete('/pessoa/:id', verifyJWT, function(req, res){
    const {id} = req.params;
    const pessoa = data.find(pes => pes.id == id);

    data.splice(pessoa, 1);
    
    res.status(200).json(pessoa);
});

//Verificando token
function verifyJWT(req, res, next){
    var token = req.headers['x-access-token'];
    if(!token)
        return res.status(401).send({auth: false, message: 'Nenhum token fornecido.'});

    jwt.verify(token, process.env.SECRET, function(err, decoded){
        if(err)
            return res.status(500).send({auth: false, message: 'Falha na autenticação do token.'});

        req.userId = decoded.id;
        next();
    });
};

//Autenticação
app.post('/login', (req, res) => {
    if(req.body.user === 'felipe' && req.body.pwd === '123'){
        const id = 1;
        var token = jwt.sign({id}, process.env.SECRET, {
            expiresIn: 30
        });
        res.status(200).send({auth: true, token: token});
    }
    res.status(500).send('Login inválido!');
});
app.get('/logout', function(req, res){
    res.status(200).send({auth: false, token: null});
});


app.listen(3000);