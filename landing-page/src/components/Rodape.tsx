function Rodape(){
    return(
        <>
        <footer className="flex justify-between text-white text-left mt-14 mb-14" >
            <div className="w-[35%]">
                <h1>NFEasy</h1>
                <p>A solução inteligente para automação contábil de Microempreendedores Individuais.</p>
            </div>

            <div>
                <h1>Produto</h1>
                <p>Recursos</p>
                <p>Como Funciona</p>
                <p>Preços</p>
            </div>

            <div className="">
                <h1>Empresa</h1>
                <p>Sobre Nós</p>
                <p>Carreiras</p>
                <p>Termos de Serviço</p>
                <p>Política de Privacidade</p>
            </div>
        </footer>

        <p className="border-t-1 border-[#374151] text-white">© 2025 NFEasy. Todos os direitos reservados.</p>
        </>

    )
}

export default Rodape