function ComoFunciona(){
    return(
        <div className="bg-[#0D121F] text-left p-9 pt-20 pb-20 flex flex-col items-center" >
            <h1 className="text-4xl font-bold text-white text-center">Como Funciona</h1>
            <p className="text-[#9CA3AF] text-center">Simplifique sua rotina contábil em apenas 3 passos</p>

            <div className="text-white flex text-left max-w-[100%] mt-5 sm:max-w-[60%]"> 
                <div className="">
                     <span className="bg-[#7C3AED] rounded-full pl-4 pr-4 pt-2.5 pb-2.5">1</span> 
                </div>
                <div className="ml-5 " >
                    <h1 className="mb-2 font-bold">Envie seus XML</h1>
                    <p>Faça upload dos arquivos XML de suas notas fiscais eletrônicas diretamente na plataforma ou envie por email.</p>
                </div>
            </div>

            <div className="text-white flex text-left max-w-[100%] mt-5 sm:max-w-[60%]"> 
                <div className="">
                     <span className="bg-[#7C3AED] rounded-full pl-4 pr-4 pt-2.5 pb-2.5">2</span> 
                </div>
                <div className="ml-5 " >
                    <h1 className="mb-2  font-bold">Processamento Automático</h1>
                    <p>Nosso sistema lê e extrai automaticamente todas as informações relevantes das NF-es, organizando os dados.</p>
                </div>
            </div>

            <div className="text-white flex text-left max-w-[100%] mt-5 sm:max-w-[60%]"> 
                <div className="">
                     <span className="bg-[#7C3AED] rounded-full pl-4 pr-4 pt-2.5 pb-2.5">3</span> 
                </div>
                <div className="ml-5 " >
                    <h1 className="mb-2 font-bold">Acesse Relatórios e Insights</h1>
                    <p>Visualize os dados processados em dashboards interativos e gere relatórios completos quando precisar.</p>
                </div> 
            </div>
        </div>
    )   
}

export default ComoFunciona