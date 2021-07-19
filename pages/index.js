import React from "react";
import nookies from "nookies";
import jwt from "jsonwebtoken";

import MainGrid from '../src/components/MainGrid'
import Box from '../src/components/Box'
import {AlurakutMenu, AlurakutProfileSidebarMenuDefault, OrkutNostalgicIconSet} from '../src/lib/FamilyKutCommons';
import {ProfileRelationsBoxWrapper} from '../src/components/ProfileRelations';

function ProfileSidebar(propriedades) {
    return (
        <Box as="aside">
            <img src={`https://github.com/${propriedades.githubUser}.png`} style={{borderRadius: '8px'}}/>
            <hr/>

            <a className="boxLink" href={`https://github.com/${propriedades.githubUser}`}>
                @{propriedades.githubUser}
            </a>
            <hr/>

            <AlurakutProfileSidebarMenuDefault/>
        </Box>
    )
}

function ProfileRelationsBox(props) {
    return (
        <ProfileRelationsBoxWrapper>
            <h2 className="smallTitle">
                {props.title} ({props.items.length})
            </h2>
            <ul>
                {/*{seguidores.map((itemAtual) => {*/}
                {/*    return (*/}
                {/*        <p>teste</p>*/}
                {/*        <li key={itemAtual}>*/}
                {/*            <a href={`/users/${itemAtual}`} key={itemAtual}>*/}
                {/*                <img src={itemAtual}/>*/}
                {/*                <span>{itemAtual}</span>*/}
                {/*            </a>*/}
                {/*        </li>*/}
                {/*    )*/}
                {/*})}*/}
            </ul>
        </ProfileRelationsBoxWrapper>
    );
}

export default function Home(props) {

    const [comunidades, setComunidades] = React.useState([]);

    const token = 'c7336f4aed30489ead79bdc7ed32be';
    const usuarioAleatorio = props.githubUser;
    const pessoasFavoritas = [
        'juunegreiros',
        'omariosouto',
        'peas',
        'rafaballerini',
        'marcobrunodev',
        'felipefialho'
    ]

    const [seguidores, setSeguidores] = React.useState([]);
    React.useEffect(function () {
        fetch('https://api.github.com/users/peas/followers')
            .then(function (repostaDoServidor) {
                return repostaDoServidor.json();
            })
            .then(function (respostaCompleta) {
                setSeguidores(respostaCompleta);
            });

        fetch(
            'https://graphql.datocms.com/',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `${token}`,
                },
                body: JSON.stringify({
                    query: `query { 
                              allCommunities {
                                id
                                title
                                imageUrl
                                creatorSlug
                                }
                             }`
                }),
            }
        ).then(res => res.json())
            .then((res) => {
                const {allCommunities: fromDatoCMS} = res.data;
                setComunidades(fromDatoCMS);
            })
            .catch((error) => {
                console.log(error);
            });

    }, []);
    return (
        <>
            <AlurakutMenu githubUser={usuarioAleatorio}/>
            <MainGrid>
                {/* <Box style="grid-area: profileArea;"> */}
                <div className="profileArea" style={{gridArea: 'profileArea'}}>
                    <ProfileSidebar githubUser={usuarioAleatorio}/>
                </div>
                <div className="welcomeArea" style={{gridArea: 'welcomeArea'}}>
                    <Box>
                        <h1 className="title">
                            Bem vindo(a)
                        </h1>

                        <OrkutNostalgicIconSet/>
                    </Box>
                    <Box>
                        <h2 className="subTitle">O que você deseja fazer?</h2>
                        <form onSubmit={function handleCriaComunidade(e) {
                            e.preventDefault();
                            const dadosDoForm = new FormData(e.target);
                            const comunidade = {
                                title: dadosDoForm.get('title'),
                                imageUrl: dadosDoForm.get('image'),
                                creatorSlug: usuarioAleatorio
                            }
                            fetch('/api/comunidades', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify(comunidade)
                            }).then(async (response) => {
                                    const dados = await response.json();
                                    const comunidade = dados.registroCriado;
                                    const comunidadesAtualizadas = [...comunidades, comunidade]
                                    setComunidades(comunidadesAtualizadas);
                                }
                            );
                        }}>
                            <div>
                                <input placeholder="Qual vai ser o nome da sua comunidade?"
                                       name="title"
                                       aria-label="Qual vai ser o nome da sua comunidade?"
                                       type="text"
                                />
                            </div>
                            <div>
                                <input placeholder="Coloque uma URL para usarmos de capa"
                                       name="image"
                                       aria-label="Coloque uma URL para usarmos de capa"
                                />
                            </div>
                            <button>
                                Criar comunidade
                            </button>
                        </form>

                    </Box>
                </div>
                <div className="profileRelationsArea" style={{gridArea: 'profileRelationsArea'}}>
                    <ProfileRelationsBox items={seguidores} title="Seguidores">

                    </ProfileRelationsBox>
                    <ProfileRelationsBoxWrapper>
                        <h2 className="smallTitle">
                            Comunidade(s) ({comunidades.length})
                        </h2>
                        <ul>
                            {comunidades.map((itemAtual) => {
                                return (
                                    <li key={itemAtual.id}>
                                        <a href={`/users/${itemAtual.title}`} key={itemAtual.title}>
                                            <img src={itemAtual.imageUrl}/>
                                            <span>{itemAtual.title}</span>
                                        </a>
                                    </li>
                                )
                            })}
                        </ul>
                    </ProfileRelationsBoxWrapper>
                    <ProfileRelationsBoxWrapper>
                        <h2 className="smallTitle">
                            Pessoas da comunidade ({pessoasFavoritas.length})
                        </h2>

                        <ul>
                            {pessoasFavoritas.map((itemAtual) => {
                                return (
                                    <li key={itemAtual}>
                                        <a href={`/users/${itemAtual}`} key={itemAtual}>
                                            <img src={`https://github.com/${itemAtual}.png`}/>
                                            <span>{itemAtual}</span>
                                        </a>
                                    </li>
                                )
                            })}
                        </ul>
                    </ProfileRelationsBoxWrapper>
                </div>
            </MainGrid>
        </>
    )
}

export async function getServerSideProps(context) {
    const cookies = nookies.get(context);
    const {USER_TOKEN: userToken} = cookies;


    const { isAuthenticated } = await fetch('https://alurakut.vercel.app/api/auth', {
        headers: {
            Authorization: `${userToken}`
        }
    }).then((resposta) => resposta.json());

    if(!isAuthenticated){
        return {
            redirect:{
                destination: '/login',
                permanent: false
            }
        }
    }

    const {githubUser} = jwt.decode(userToken);
    return {
        props: {
            githubUser
        } //will be passe do the page component as props
    }
}