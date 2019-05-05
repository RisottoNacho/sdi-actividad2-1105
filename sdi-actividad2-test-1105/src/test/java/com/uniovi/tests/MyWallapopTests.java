package com.uniovi.tests;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import java.util.List;

import org.junit.After;
import org.junit.AfterClass;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.FixMethodOrder;
import org.junit.Test;
import org.junit.runners.MethodSorters;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.firefox.FirefoxDriver;


import com.uniovi.tests.pageobjects.PO_AddOfferView;
import com.uniovi.tests.pageobjects.PO_HomeView;
import com.uniovi.tests.pageobjects.PO_LoginView;
import com.uniovi.tests.pageobjects.PO_RegisterView;
import com.uniovi.tests.pageobjects.PO_View;
import com.uniovi.tests.utils.SeleniumUtils;

//Ordenamos las pruebas por el nombre del método
@FixMethodOrder(MethodSorters.NAME_ASCENDING)
public class MyWallapopTests {

	// @Autowired
	// private UsersService usersService;
	// @Autowired
	// private RolesService rolesService;
	// @Autowired
	// private UsersRepository usersRepository;

	// En Windows (Debe ser la versión 65.0.1 y desactivar las actualizacioens
	// automáticas)):
	static String PathFirefox64 = "C:\\Program Files\\Mozilla Firefox\\firefox.exe";
	static String Geckdriver022 = "C:\\Users\\UO258014\\Desktop\\gecko\\geckodriver024win64.exe";
	// En MACOSX (Debe ser la versión 65.0.1 y desactivar las actualizacioens
	// automáticas):
	// static String PathFirefox65 =
	// "/Applications/Firefox.app/Contents/MacOS/firefox-bin";
	// static String Geckdriver024 = "/Users/delacal/selenium/geckodriver024mac";
	// Común a Windows y a MACOSX
	static WebDriver driver = getDriver(PathFirefox64, Geckdriver022);
	static String URL = "http://localhost:8081";
	// static String URLremota = "http://urlsdispring:xxxx";

	public static WebDriver getDriver(String PathFirefox, String Geckdriver) {
		System.setProperty("webdriver.firefox.bin", PathFirefox);
		System.setProperty("webdriver.gecko.driver", Geckdriver);
		WebDriver driver = new FirefoxDriver();
		return driver;
	}

	// Antes de cada prueba se navega al URL home de la aplicaciónn
	@Before
	public void setUp() {
		// initdb();
		driver.navigate().to(URL);
	}

	// Después de cada prueba se borran las cookies del navegador
	@After
	public void tearDown() {
		driver.manage().deleteAllCookies();
		// PO_HomeView.clickOption(driver, "desconectarse", "id", "logout");
	}

	// Registro de Usuario con datos válidos.
	@Test
	public void PR01() {
		PO_HomeView.clickOption(driver, "registrarse", "id", "register");
		PO_RegisterView.fillForm(driver, "admin@email.com", "FFF", "OOOOOO", "admin", "admin");
		PO_HomeView.clickOption(driver, "registrarse", "id", "register");
		PO_RegisterView.fillForm(driver, "prueba1@prueba1.com", "Josefo", "Perez", "prueba1", "prueba1");
		PO_View.checkElement(driver, "text", "Nuevo usuario registrado");
		PO_HomeView.clickOption(driver, "registrarse", "id", "register");
		PO_RegisterView.fillForm(driver, "prueba2@prueba2.com", "Josefo", "Perez", "prueba1", "prueba1");
		PO_View.checkElement(driver, "text", "Nuevo usuario registrado");
		PO_HomeView.clickOption(driver, "registrarse", "id", "register");
		PO_RegisterView.fillForm(driver, "prueba3@prueba3.com", "Josefo", "Perez", "prueba1", "prueba1");
		PO_View.checkElement(driver, "text", "Nuevo usuario registrado");
		PO_HomeView.clickOption(driver, "registrarse", "id", "register");
		PO_RegisterView.fillForm(driver, "prueba4@prueba4.com", "Josefo", "Perez", "prueba1", "prueba1");
		PO_View.checkElement(driver, "text", "Nuevo usuario registrado");
		PO_HomeView.clickOption(driver, "registrarse", "id", "register");
		PO_RegisterView.fillForm(driver, "prueba5@prueba5.com", "Josefo", "Perez", "prueba1", "prueba1");
		PO_View.checkElement(driver, "text", "Nuevo usuario registrado");
		PO_HomeView.clickOption(driver, "registrarse", "id", "register");
		PO_RegisterView.fillForm(driver, "prueba6@prueba6.com", "Josefo", "Perez", "prueba1", "prueba1");
		PO_View.checkElement(driver, "text", "Nuevo usuario registrado");
	}

	// Registro de Usuario con datos inválidos (email vacío, repetición de
	// contraseña inválida)
	@Test
	public void PR02() {
		PO_HomeView.clickOption(driver, "registrarse", "id", "register");
		PO_RegisterView.fillForm(driver, " ", "Josefo", "Perez", "77777", "77777");
		PO_RegisterView.checkElement(driver, "text", "Todos los campos son obligatorios");
		PO_RegisterView.fillForm(driver, "pe@gmail.com", " ", "Perez", "77777", "77777");
		PO_RegisterView.checkElement(driver, "text", "Todos los campos son obligatorios");
		PO_RegisterView.fillForm(driver, "pe@gmail.com", "Josefo", "Perez", "77777", "77");
		PO_RegisterView.checkElement(driver, "text", "Las contraseñas deben coincidir");
	}

	// Registro de Usuario con email existente.
	@Test
	public void PR03() {
		PO_HomeView.clickOption(driver, "registrarse", "id", "register");
		PO_RegisterView.fillForm(driver, "prueba1@prueba1.com", "Josefo", "Perez", "77777", "77777");
		PO_RegisterView.checkElement(driver, "text", "El email ya está registrado");
	}

	// Inicio de sesión con datos válidos
	@Test
	public void PR04() {
		// PO_HomeView.clickOption(driver, "identificarse", "id", "login");
		PO_LoginView.fillForm(driver, "prueba1@prueba1.com", "prueba1");
		PO_RegisterView.checkElement(driver, "text", "Mi Perfil");
	}

	// Inicio de sesión con datos inválidos (email existente, pero contraseña
	// incorrecta).
	@Test
	public void PR05() {
		PO_LoginView.fillForm(driver, "prueba1@prueba1.com", "eba1");
		PO_RegisterView.checkElement(driver, "text", "Email o password incorrecto");
	}

	// Inicio de sesión con datos válidos (campo email o contraseña vacíos).
	@Test
	public void PR06() {
		PO_LoginView.fillForm(driver, "prueba1@prueba1.com", "");
		PO_RegisterView.checkElement(driver, "text", "No puede haber campos vacios");
	}

	// Inicio de sesión con datos inválidos (email no existente en la aplicación).
	@Test
	public void PR07() {
		PO_LoginView.fillForm(driver, "pa1@prueba1.com", "prueba1");
		PO_RegisterView.checkElement(driver, "text", "Email o password incorrecto");
	}

	// Hacer click en la opción de salir de sesión y comprobar que se redirige a la
	// página de inicio de sesion
	@Test
	public void PR08() {
		PO_LoginView.fillForm(driver, "prueba1@prueba1.com", "prueba1");
		PO_RegisterView.checkElement(driver, "text", "Mi Perfil");
		PO_HomeView.clickOption(driver, "desconectarse", "text", "Identificación de usuario");
		// SeleniumUtils.EsperaCargaPagina(driver, "text", "Sala de Chat", 5000);
		// PO_RegisterView.checkElement(driver, "text", "Registrate");
	}

	// Comprobar que el botón cerrar sesión no está visible si el usuario no está
	// autenticado.
	@Test
	public void PR09() {
		SeleniumUtils.textoNoPresentePagina(driver, "Desconectar");
	}

	// Mostrar el listado de usuarios y comprobar que se muestran todos los que
	// existen en el
	// sistema.
	@Test
	public void PR10() {
		// PO_HomeView.clickOption(driver, "registrarse", "id", "register");
		// PO_RegisterView.fillForm(driver, "prueba2@prueba2.com", "Josefo", "Perez",
		// "prueba2", "prueba2");
		PO_LoginView.fillForm(driver, "admin@email.com", "admin");
		SeleniumUtils.textoPresentePagina(driver, "prueba1@prueba1.com");
		SeleniumUtils.textoPresentePagina(driver, "prueba2@prueba2.com");
		SeleniumUtils.textoPresentePagina(driver, "prueba3@prueba3.com");
		SeleniumUtils.textoPresentePagina(driver, "prueba4@prueba4.com");
		SeleniumUtils.textoPresentePagina(driver, "prueba5@prueba5.com");
		SeleniumUtils.textoPresentePagina(driver, "prueba6@prueba6.com");
	}

	// Ir a la lista de usuarios, borrar el primer usuario de la lista, comprobar
	// que la lista se actualiza
	// y dicho usuario desaparece.

	@Test
	public void PR11() {
		PO_LoginView.fillForm(driver, "admin@email.com", "admin");
		driver.findElement(By.id("cbprueba1@prueba1.com")).click();
		driver.findElement(By.name("deleteUsers")).click();
		SeleniumUtils.textoNoPresentePagina(driver, "prueba1@prueba1.com");
	}

	// Ir a la lista de usuarios, borrar el último usuario de la lista, comprobar
	// que la lista se actualiza
	// y dicho usuario desaparece.

	@Test
	public void PR12() {
		PO_LoginView.fillForm(driver, "admin@email.com", "admin");
		driver.findElement(By.id("cbprueba6@prueba6.com")).click();
		driver.findElement(By.name("deleteUsers")).click();
		SeleniumUtils.textoNoPresentePagina(driver, "prueba6@prueba6.com");
	}

//	Ir a la lista de usuarios, borrar 3 usuarios, comprobar que la lista se actualiza y dichos
	// usuarios desaparecen.
	@Test
	public void PR13() {
		PO_LoginView.fillForm(driver, "admin@email.com", "admin");
		driver.findElement(By.id("cbprueba5@prueba5.com")).click();
		driver.findElement(By.id("cbprueba4@prueba4.com")).click();
		driver.findElement(By.id("cbprueba3@prueba3.com")).click();
		driver.findElement(By.name("deleteUsers")).click();
		SeleniumUtils.textoNoPresentePagina(driver, "prueba5@prueba5.com");
		SeleniumUtils.textoNoPresentePagina(driver, "prueba5@prueba4.com");
		SeleniumUtils.textoNoPresentePagina(driver, "prueba3@prueba3.com");
	}

//	Ir al formulario de alta de oferta, rellenarla con datos válidos y pulsar el botón Submit.
	// Comprobar que la oferta sale en el listado de ofertas de dicho usuario
	@Test
	public void PR14() {
		PO_HomeView.clickOption(driver, "registrarse", "id", "register");
		PO_RegisterView.fillForm(driver, "prueba1@prueba1.com", "Josefo", "Perez", "prueba1", "prueba1");
		PO_View.checkElement(driver, "text", "Nuevo usuario registrado");
		PO_LoginView.fillForm(driver, "prueba2@prueba2.com", "prueba1");
		driver.findElement(By.id("mNuevaOferta")).click();
		PO_AddOfferView.fillForm(driver, "test1", "aquello", "5");
		SeleniumUtils.textoPresentePagina(driver, "test1");
	}

//	 Ir al formulario de alta de oferta, rellenarla con datos inválidos (campo título vacío) y pulsar
	// el botón Submit. Comprobar que se muestra el mensaje de campo obligatorio.
	@Test
	public void PR15() {
		PO_LoginView.fillForm(driver, "prueba2@prueba2.com", "prueba1");
		driver.findElement(By.id("mNuevaOferta")).click();
		PO_AddOfferView.fillForm(driver, "", "aquello", "5");
		SeleniumUtils.textoPresentePagina(driver, "Todos los campos son obligatorios");
	}

	// Mostrar el listado de ofertas para dicho usuario y comprobar que se muestran
	// todas los que
	// existen para este usuario
	@Test
	public void PR16() {
		PO_LoginView.fillForm(driver, "prueba2@prueba2.com", "prueba1");
		driver.findElement(By.id("mNuevaOferta")).click();
		PO_AddOfferView.fillForm(driver, "test2", "aquello", "5");
		driver.findElement(By.id("mNuevaOferta")).click();
		PO_AddOfferView.fillForm(driver, "test3", "aquello", "5");
		SeleniumUtils.textoPresentePagina(driver, "test1");
		SeleniumUtils.textoPresentePagina(driver, "test2");
		SeleniumUtils.textoPresentePagina(driver, "test3");
	}

//	 Ir a la lista de ofertas, borrar la primera oferta de la lista, comprobar que la lista se actualiza y
	// que la oferta desaparece.
	@Test
	public void PR17() {
		PO_LoginView.fillForm(driver, "prueba2@prueba2.com", "prueba1");
		driver.findElements(By.name("del")).get(0).click();
		SeleniumUtils.textoNoPresentePagina(driver, "test1");
	}

//	Ir a la lista de ofertas, borrar la última oferta de la lista, comprobar que la lista se actualiza y
	// que la oferta desaparece
	@Test
	public void PR18() {
		PO_LoginView.fillForm(driver, "prueba2@prueba2.com", "prueba1");
		List<WebElement> ls = driver.findElements(By.name("del"));
		ls.get(ls.size() - 1).click();
		SeleniumUtils.textoNoPresentePagina(driver, "test3");
	}

//	Hacer una búsqueda con el campo vacío y comprobar que se muestra la página que
	// corresponde con el listado de las ofertas existentes en el sistema
	@Test
	public void PR19() {
		PO_LoginView.fillForm(driver, "prueba2@prueba2.com", "prueba1");
		driver.findElement(By.id("mNuevaOferta")).click();
		PO_AddOfferView.fillForm(driver, "test4", "aquello", "5");
		driver.findElement(By.id("mNuevaOferta")).click();
		PO_AddOfferView.fillForm(driver, "test6", "aquello", "5");
		driver.findElement(By.id("mNuevaOferta")).click();
		PO_AddOfferView.fillForm(driver, "test5", "aquello", "5");
		PO_HomeView.clickOption(driver, "desconectarse", "text", "Identificación de usuario");
		PO_LoginView.fillForm(driver, "prueba1@prueba1.com", "prueba1");
		driver.findElement(By.id("mCompras")).click();
		driver.findElement(By.id("lupiña")).click();
		SeleniumUtils.textoPresentePagina(driver, "test2");
		SeleniumUtils.textoPresentePagina(driver, "test4");
		SeleniumUtils.textoPresentePagina(driver, "test5");
		SeleniumUtils.textoPresentePagina(driver, "test6");
	}

//	 Hacer una búsqueda escribiendo en el campo un texto que no exista y comprobar que se
	// muestra la página que corresponde, con la lista de ofertas vacía.

	@Test
	public void PR20() {
		PO_LoginView.fillForm(driver, "prueba1@prueba1.com", "prueba1");
		driver.findElement(By.id("mCompras")).click();
		driver.findElement(By.id("searchBox")).sendKeys("BAOBAB");
		driver.findElement(By.id("lupiña")).click();
		assertEquals(0, driver.findElements(By.name("row")).size());
	}

//	Hacer una búsqueda escribiendo en el campo un texto en minúscula o mayúscula y
	// comprobar que se muestra la página que corresponde, con la lista de ofertas
	// que contengan dicho texto,
	// independientemente que el título esté almacenado en minúsculas o mayúscula.
	@Test
	public void PR21() {
		PO_LoginView.fillForm(driver, "prueba1@prueba1.com", "prueba1");
		driver.findElement(By.id("mCompras")).click();
		driver.findElement(By.id("searchBox")).sendKeys("TEST2");
		driver.findElement(By.id("lupiña")).click();
		SeleniumUtils.textoPresentePagina(driver, "test2");
		driver.findElement(By.id("mCompras")).click();
		driver.findElement(By.id("searchBox")).sendKeys("test2");
		driver.findElement(By.id("lupiña")).click();
		SeleniumUtils.textoPresentePagina(driver, "test2");
	}

//	 Sobre una búsqueda determinada (a elección de desarrollador), comprar una oferta que deja
	// un saldo positivo en el contador del comprobador. Y comprobar que el contador
	// se actualiza
	// correctamente en la vista del comprador.
	@Test
	public void PR22() {
		PO_LoginView.fillForm(driver, "prueba1@prueba1.com", "prueba1");
		driver.findElement(By.id("mCompras")).click();
		driver.findElement(By.id("searchBox")).sendKeys("TEST2");
		driver.findElement(By.id("lupiña")).click();
		driver.findElement(By.name("buy")).click();
		SeleniumUtils.textoPresentePagina(driver, "prueba1@prueba1.com: 95€");
	}

//	Sobre una búsqueda determinada (a elección de desarrollador), comprar una oferta que deja
	// un saldo 0 en el contador del comprobador. Y comprobar que el contador se
	// actualiza correctamente en
	// la vista del comprador.
	@Test
	public void PR23() {
		PO_LoginView.fillForm(driver, "prueba2@prueba2.com", "prueba1");
		driver.findElement(By.id("mNuevaOferta")).click();
		PO_AddOfferView.fillForm(driver, "ruina", "si", "95");
		PO_HomeView.clickOption(driver, "desconectarse", "text", "Identificación de usuario");
		PO_LoginView.fillForm(driver, "prueba1@prueba1.com", "prueba1");
		driver.findElement(By.id("mCompras")).click();
		driver.findElement(By.id("searchBox")).sendKeys("ruina");
		driver.findElement(By.id("lupiña")).click();
		driver.findElement(By.name("buy")).click();
		SeleniumUtils.textoPresentePagina(driver, "prueba1@prueba1.com: 0€");

	}

//	SoSobre una búsqueda determinada (a elección de desarrollador), intentar comprar una oferta
	// que esté por encima de saldo disponible del comprador. Y comprobar que se
	// muestra el mensaje de
	// saldo no suficiente.

	@Test
	public void PR24() {
		PO_LoginView.fillForm(driver, "prueba1@prueba1.com", "prueba1");
		driver.findElement(By.id("mCompras")).click();
		driver.findElement(By.id("searchBox")).sendKeys("test6");
		driver.findElement(By.id("lupiña")).click();
		SeleniumUtils.textoPresentePagina(driver, "Saldo insuficiente");

	}

//	Ir a la opción de ofertas compradas del usuario y mostrar la lista. Comprobar que aparecen
	// las ofertas que deben aparecer.
	@Test
	public void PR25() {
		PO_LoginView.fillForm(driver, "prueba1@prueba1.com", "prueba1");
		SeleniumUtils.textoPresentePagina(driver, "test2");
		SeleniumUtils.textoPresentePagina(driver, "ruina");
	}

//	 Inicio de sesión con datos válidos.
	@Test
	public void PR29() {
		driver.findElement(By.id("mChat")).click();
		SeleniumUtils.EsperaCargaPagina(driver, "text", "Salir de la sala", PO_View.getTimeout());
		driver.findElement(By.id("email")).sendKeys("prueba1@prueba1.com");
		driver.findElement(By.id("password")).sendKeys("prueba1");
		driver.findElement(By.id("boton-login")).click();
		SeleniumUtils.EsperaCargaPagina(driver, "text", "Chats de tus ofertas", PO_View.getTimeout());
	}

//	  Inicio de sesión con datos inválidos (email existente, pero contraseña incorrecta)
	@Test
	public void PR30() {
		driver.findElement(By.id("mChat")).click();
		SeleniumUtils.EsperaCargaPagina(driver, "text", "Salir de la sala", PO_View.getTimeout());
		driver.findElement(By.id("email")).sendKeys("prueba1@prueba1.com");
		driver.findElement(By.id("password")).sendKeys("prudaseba1");
		driver.findElement(By.id("boton-login")).click();
		SeleniumUtils.EsperaCargaPagina(driver, "text", "Usuario no encontrado", PO_View.getTimeout());
	}

//	  Inicio de sesión con datos válidos (campo email o contraseña vacíos).
	@Test
	public void PR31() {
		driver.findElement(By.id("mChat")).click();
		SeleniumUtils.EsperaCargaPagina(driver, "text", "Salir de la sala", PO_View.getTimeout());
		driver.findElement(By.id("email")).sendKeys("prueba1@prueba1.com");
		driver.findElement(By.id("password")).sendKeys("");
		driver.findElement(By.id("boton-login")).click();
		SeleniumUtils.EsperaCargaPagina(driver, "text", "Usuario no encontrado", PO_View.getTimeout());
	}

//	  Mostrar el listado de ofertas disponibles y comprobar que se muestran todas las que existen,
//	menos las del usuario identificado.
	@Test
	public void PR32() {
		PO_LoginView.fillForm(driver, "prueba1@prueba1.com", "prueba1");
		driver.findElement(By.id("mNuevaOferta")).click();
		PO_AddOfferView.fillForm(driver, "Jesus", "si", "95");
		PO_HomeView.clickOption(driver, "desconectarse", "text", "Identificación de usuario");
		driver.findElement(By.id("mChat")).click();
		SeleniumUtils.EsperaCargaPagina(driver, "text", "Salir de la sala", PO_View.getTimeout());
		driver.findElement(By.id("email")).sendKeys("prueba1@prueba1.com");
		driver.findElement(By.id("password")).sendKeys("prueba1");
		driver.findElement(By.id("boton-login")).click();
		SeleniumUtils.EsperaCargaPagina(driver, "text", "test2", PO_View.getTimeout());
		SeleniumUtils.EsperaCargaPagina(driver, "text", "test4", PO_View.getTimeout());
		SeleniumUtils.EsperaCargaPagina(driver, "text", "test6", PO_View.getTimeout());
		SeleniumUtils.EsperaCargaPagina(driver, "text", "test5", PO_View.getTimeout());
		SeleniumUtils.EsperaCargaPaginaNoTexto(driver, "Jesus", PO_View.getTimeout());
	}
	
//	   Sobre una búsqueda determinada de ofertas (a elección de desarrollador), enviar un mensaje a
	//una oferta concreta. Se abriría dicha conversación por primera vez. Comprobar que el mensaje aparece
	//en el listado de mensajes
	@Test
	public void PR33() {
		driver.findElement(By.id("mChat")).click();
		SeleniumUtils.EsperaCargaPagina(driver, "text", "Salir de la sala", PO_View.getTimeout());
		driver.findElement(By.id("email")).sendKeys("prueba1@prueba1.com");
		driver.findElement(By.id("password")).sendKeys("prueba1");
		driver.findElement(By.id("boton-login")).click();
		SeleniumUtils.EsperaCargaPagina(driver, "text", "test2", PO_View.getTimeout());
		driver.findElement(By.id("filtro-nombre")).sendKeys("test2");
		SeleniumUtils.EsperaCargaPagina(driver, "text", "test2", PO_View.getTimeout());
		driver.findElement(By.name("chatSeller")).click();
		SeleniumUtils.EsperaCargaPagina(driver, "text", "Chat con prueba2@prueba2.com", PO_View.getTimeout());
		driver.findElement(By.id("MsInput")).sendKeys("Message test");
		driver.findElement(By.id("sendButton")).click();
		SeleniumUtils.EsperaCargaPagina(driver, "text", "Message test", PO_View.getTimeout());
		
	}
	
	
//	   Sobre una búsqueda determinada de ofertas (a elección de desarrollador), enviar un mensaje a
	//una oferta concreta. Se abriría dicha conversación por primera vez. Comprobar que el mensaje aparece
	//en el listado de mensajes
	@Test
	public void PR34() {
		driver.findElement(By.id("mChat")).click();
		SeleniumUtils.EsperaCargaPagina(driver, "text", "Salir de la sala", PO_View.getTimeout());
		driver.findElement(By.id("email")).sendKeys("prueba2@prueba2.com");
		driver.findElement(By.id("password")).sendKeys("prueba1");
		driver.findElement(By.id("boton-login")).click();
		SeleniumUtils.EsperaCargaPagina(driver, "text", "prueba1@prueba1.com", PO_View.getTimeout());
		driver.findElement(By.id("filtro-nombre")).sendKeys("test2");
		SeleniumUtils.EsperaCargaPagina(driver, "text", "prueba1@prueba1.com", PO_View.getTimeout());
		driver.findElement(By.name("chatBuyer")).click();
		SeleniumUtils.EsperaCargaPagina(driver, "text", "Chat con prueba1@prueba1.com", PO_View.getTimeout());
		driver.findElement(By.id("MsInput")).sendKeys("Message test response");
		SeleniumUtils.EsperaCargaPagina(driver, "text", "Message test", PO_View.getTimeout());
		driver.findElement(By.id("sendButton")).click();
		SeleniumUtils.EsperaCargaPagina(driver, "text", "Message test response", PO_View.getTimeout());
		
	}

	// Antes de la primera prueba
	@BeforeClass
	static public void begin() {
	}

	// Al finalizar la última prueba
	@AfterClass
	static public void end() {
		// Cerramos el navegador al finalizar las pruebas
		driver.quit();
	}

}