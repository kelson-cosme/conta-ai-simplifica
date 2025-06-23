function Planos(){
    return(
        <>
            <h1 className="text-4xl font-bold text-white">Plano Acessíveil</h1>
            <p className="text-white mb-7">Escolha o plano que melhor atende às necessidades do seu negócio</p>


            <div className="bg-[linear-gradient(180deg,#0D121F,#02050e)] max-w-[25em] m-auto text-white p-10 relative rounded-2xl border border-[#7c3aed]">

                <div className="absolute bg-[#7c3aed] rounded-2xl pl-5 pr-5 top-[-10px] left-[39%]">Poupular</div>
                <h2 className="text-2xl font-bold">Profissional</h2>

                <span className="flex m-auto text-center w-full justify-center"><h3 className="text-5xl font-extrabold text-[#7C3AED]">R$ 59 </h3><p className="text-2xl font-mono text-white">/mês</p></span>
                <p className="mt-9">Processamento de NF-es</p>
                <p className="mt-5">Relatórios personalizados</p>
                <p  className="mt-5">Assistente de IA básico</p>
                <p className="mt-5">Suporte 24/7</p> 
                <button className="bg-[#7c3aed] pl-10 pr-10 pt-2 pb-2 rounded-[9px] mt-5">Assinar</button>
            </div>
        </>
    )
}

export default Planos