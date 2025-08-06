import React, { useContext, useEffect, useState } from "react";
import Head from "next/head";

import { push, useRouter } from "next/router";

function Layout({ children }) {
  return (
    <div style={{ display: "grid" }}>
      <Head>
        <title>Test</title>
        <meta name="description" content="Test." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link
          href="https://fonts.googleapis.com/css2?family=Quicksand:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Kanit:wght@400;600;700;900&display=swap"
          rel="stylesheet"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@100;200;400;600;700;900&display=swap"
          rel="stylesheet"
        />
      </Head>

      {/* <div className="flex w-dvw h-dvh justify-center items-center">
        <h1>Pagina momentaneamente fuera de servicio</h1>
      </div> */}

      <div className="min-h-dvh">{children}</div>
    </div>
  );
}

export default Layout;
