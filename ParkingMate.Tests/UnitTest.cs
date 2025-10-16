using NUnit.Framework;
using ServiceStack;
using ServiceStack.Testing;
using ParkingMate.ServiceInterface;
using ParkingMate.ServiceModel;

namespace ParkingMate.Tests;

public class UnitTest
{
    private readonly ServiceStackHost appHost;

    public UnitTest()
    {
        appHost = new BasicAppHost().Init();
        appHost.Container.AddTransient<AuthServices>();
    }

    [OneTimeTearDown]
    public void OneTimeTearDown() => appHost.Dispose();

    [Test]
    public void Can_resolve_AuthServices()
    {
        var service = appHost.Container.Resolve<AuthServices>();
        Assert.That(service, Is.Not.Null);
    }
}