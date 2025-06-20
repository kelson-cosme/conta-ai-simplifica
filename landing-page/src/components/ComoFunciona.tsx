function ComoFunciona(){
    return(
        <div className="bg-[#0D121F] text-left">
            <h1 className="text-4xl font-bold text-white text-center">Como Funciona</h1>
            <p className="text-[#9CA3AF] text-center">Simplifique sua rotina contábil em apenas 3 passos</p>

            <div className="text-white flex text-left max-w-[50%]  mt-13 m-auto  w-10%"> 
                <div className="flex items-center justify-center"> <span className="bg-[#7C3AED] p-5 rounded-full ">1</span> </div>
                <div className="">
                    <h1>Envie seus XML</h1>
                    <p>Faça upload dos arquivos XML de suas notas fiscais eletrônicas diretamente na plataforma ou envie por email.</p>
                </div>
            </div>

            <div className="text-white flex text-left max-w-[50%] m-auto mt-13"> 
                <div className="flex items-center justify-center"> <span className="bg-[#7C3AED] p-5 rounded-full">2</span> </div>
                <div className="">
                    <h1>Processamento Automático</h1>
                    <p>Nosso sistema lê e extrai automaticamente todas as informações relevantes das NF-es, organizando os dados.</p>
                </div>
            </div>

            <div className="text-white flex text-left m-auto mt-13 max-w-[50%]"> 
                <div className="zyy"> <span className="bg-[#7C3AED] p-5 rounded-full">3</span> </div>
                <div className="">
                    <h1>Acesse Relatórios e Insights</h1>
                    <p>Visualize os dados processados em dashboards interativos e gere relatórios completos quando precisar.</p>
                </div>
            </div>
        </div>
    )   
}

export default ComoFunciona